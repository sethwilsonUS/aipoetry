import { mutation } from './_generated/server';
import { v } from 'convex/values';

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
// Override via RATE_LIMIT_MAX env var in the Convex dashboard.
// Set a high value (e.g. 1000) in dev, leave unset in prod to keep the default of 5.
const MAX_REQUESTS_PER_WINDOW = process.env.RATE_LIMIT_MAX
  ? parseInt(process.env.RATE_LIMIT_MAX, 10)
  : 5;

export const checkRateLimit = mutation({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    const rateLimitDoc = await ctx.db
      .query('rateLimits')
      .withIndex('by_identifier', (q) => q.eq('identifier', args.identifier))
      .unique();

    if (!rateLimitDoc) {
      await ctx.db.insert('rateLimits', {
        identifier: args.identifier,
        requests: [now],
      });
      return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
    }

    const recentRequests = rateLimitDoc.requests.filter((t) => t > windowStart);

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
      return { allowed: false, remaining: 0 };
    }

    await ctx.db.patch(rateLimitDoc._id, {
      requests: [...recentRequests, now],
    });

    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - recentRequests.length - 1 };
  },
});
