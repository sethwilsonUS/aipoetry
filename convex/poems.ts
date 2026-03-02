import { query, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { STYLES } from './stylesConfig';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const poems = await ctx.db.query('poems').collect();
    return poems
      .filter((poem) => poem.isPublic !== false)
      .map((poem) => ({
        id: poem._id,
        title: poem.title,
        styleName: poem.styleName,
      }));
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

    const styleConfig = STYLES.find((s) => s.name === poem.styleName);
    const imageUrl =
      poem.imageStorageId ? await ctx.storage.getUrl(poem.imageStorageId) : null;

    return {
      ...poem,
      styleExplanation: styleConfig?.userExplanation ?? '',
      imageUrl,
    };
  },
});

// Internal query used by generateImage action to fetch poem + topic name.
export const getForImageGen = internalQuery({
  args: { id: v.id('poems') },
  handler: async (ctx, args) => {
    const poem = await ctx.db.get(args.id);
    if (!poem) return null;
    const topic = await ctx.db.get(poem.topicId);
    return { ...poem, topicName: topic?.name ?? '' };
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

export const updateImageStatus = internalMutation({
  args: {
    id: v.id('poems'),
    imageStatus: v.union(
      v.literal('pending'),
      v.literal('generating'),
      v.literal('complete'),
      v.literal('error'),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { imageStatus: args.imageStatus });
  },
});

export const updateImage = internalMutation({
  args: {
    id: v.id('poems'),
    imageStorageId: v.id('_storage'),
    imageStatus: v.union(
      v.literal('pending'),
      v.literal('generating'),
      v.literal('complete'),
      v.literal('error'),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      imageStorageId: args.imageStorageId,
      imageStatus: args.imageStatus,
    });
  },
});
