import { query, internalMutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const poems = await ctx.db.query('poems').collect();

    const poemsWithStyles = await Promise.all(
      poems
        .filter((poem) => poem.isPublic !== false)
        .map(async (poem) => {
          const style = await ctx.db.get(poem.styleId);
          return {
            id: poem._id,
            title: poem.title,
            styleName: style?.name ?? 'Unknown',
          };
        })
    );

    return poemsWithStyles;
  },
});

export const listIds = query({
  args: {},
  handler: async (ctx) => {
    const poems = await ctx.db.query('poems').collect();
    return poems
      .filter((poem) => poem.isPublic !== false)
      .map((poem) => ({ id: poem._id }));
  },
});

export const getById = query({
  args: { id: v.id('poems') },
  handler: async (ctx, args) => {
    const poem = await ctx.db.get(args.id);
    if (!poem) return null;

    const style = await ctx.db.get(poem.styleId);

    return {
      ...poem,
      styleName: style?.name ?? 'Unknown',
      styleExplanation: style?.userExplanation ?? '',
    };
  },
});


export const updateContent = internalMutation({
  args: {
    id: v.id('poems'),
    title: v.string(),
    lines: v.array(v.string()),
    status: v.union(v.literal('generating'), v.literal('complete'), v.literal('error')),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const setError = internalMutation({
  args: { id: v.id('poems') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: 'error' });
  },
});
