import { mutation } from './_generated/server';
import { v } from 'convex/values';

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const POEM_LIMIT = process.env.RATE_LIMIT_MAX_POEMS
  ? parseInt(process.env.RATE_LIMIT_MAX_POEMS, 10)
  : 20;

const IMAGE_LIMIT = process.env.RATE_LIMIT_MAX_IMAGES
  ? parseInt(process.env.RATE_LIMIT_MAX_IMAGES, 10)
  : 5;

const DEEP_ANALYSIS_LIMIT = process.env.RATE_LIMIT_MAX_DEEP_ANALYSES
  ? parseInt(process.env.RATE_LIMIT_MAX_DEEP_ANALYSES, 10)
  : 5;

function getLimitForKind(kind: string): number {
  if (kind === 'image') return IMAGE_LIMIT;
  if (kind === 'deepAnalysis') return DEEP_ANALYSIS_LIMIT;
  return POEM_LIMIT;
}

export const checkRateLimit = mutation({
  args: {
    identifier: v.string(),
    kind: v.union(v.literal('poem'), v.literal('image'), v.literal('deepAnalysis')),
  },
  handler: async (ctx, args) => {
    const compositeId = `${args.kind}:${args.identifier}`;
    const limit = getLimitForKind(args.kind);
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    const rateLimitDoc = await ctx.db
      .query('rateLimits')
      .withIndex('by_identifier', (q) => q.eq('identifier', compositeId))
      .unique();

    if (!rateLimitDoc) {
      await ctx.db.insert('rateLimits', {
        identifier: compositeId,
        requests: [now],
      });
      return { allowed: true, remaining: limit - 1 };
    }

    const recentRequests = rateLimitDoc.requests.filter((t) => t > windowStart);

    if (recentRequests.length >= limit) {
      return { allowed: false, remaining: 0 };
    }

    await ctx.db.patch(rateLimitDoc._id, {
      requests: [...recentRequests, now],
    });

    return { allowed: true, remaining: limit - recentRequests.length - 1 };
  },
});
