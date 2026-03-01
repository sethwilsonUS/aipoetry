import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('topics')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .unique();
  },
});

export const insertOrGet = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('topics')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert('topics', { name: args.name });
  },
});
