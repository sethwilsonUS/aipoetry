import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { IMAGE_STYLES } from './imageStyles';

type ImageResult =
  | { success: true }
  | { success: false; error: string };

export const requestImageGeneration = mutation({
  args: {
    poemId: v.id('poems'),
    artStyle: v.string(),
    identifier: v.string(),
  },
  handler: async (ctx, args): Promise<ImageResult> => {
    const poem = await ctx.db.get(args.poemId);
    if (!poem) return { success: false, error: 'Poem not found.' };
    if (poem.isPublic === true) {
      return { success: false, error: 'Published poems cannot have images generated.' };
    }
    if (poem.status !== 'complete') {
      return { success: false, error: 'Poem must be complete before generating an image.' };
    }
    if (poem.imageStatus === 'generating') {
      return { success: false, error: 'Image is already being generated.' };
    }

    const artStyleConfig = IMAGE_STYLES.find((s) => s.name === args.artStyle);
    if (!artStyleConfig || args.artStyle === 'none') {
      return { success: false, error: 'Please select a valid illustration style.' };
    }

    const rateLimitResult = await ctx.runMutation(api.rateLimiter.checkRateLimit, {
      identifier: args.identifier,
      kind: 'image',
    });
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'You\u2019ve reached the daily image limit. Try again tomorrow!',
      };
    }

    if (poem.imageStorageId) {
      await ctx.storage.delete(poem.imageStorageId);
    }

    await ctx.db.patch(args.poemId, {
      artStyle: args.artStyle,
      imageStatus: 'generating',
      imageStorageId: undefined,
      imageDescription: undefined,
    });

    await ctx.scheduler.runAfter(0, internal.generateImage.runImageGeneration, {
      poemId: args.poemId,
    });

    return { success: true };
  },
});
