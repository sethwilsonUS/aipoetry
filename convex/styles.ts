import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('styles').collect();
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('styles')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id('styles') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const insert = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    userExplanation: v.string(),
    numberOfLines: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('styles')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert('styles', args);
  },
});
