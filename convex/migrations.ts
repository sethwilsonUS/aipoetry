import { internalMutation } from './_generated/server';

/**
 * One-time migration: backfill poems that have isPublic === undefined.
 * Under the old filter (isPublic !== false), these appeared in the archive.
 * Under the new filter (isPublic === true), they would vanish.
 * This sets them to isPublic: true to preserve prior visibility.
 *
 * Run once from the Convex dashboard via:
 *   npx convex run --no-push migrations:backfillIsPublic
 */
export const backfillIsPublic = internalMutation({
  args: {},
  handler: async (ctx) => {
    const poems = await ctx.db.query('poems').collect();
    let patched = 0;
    for (const poem of poems) {
      if (poem.isPublic === undefined) {
        await ctx.db.patch(poem._id, { isPublic: true });
        patched++;
      }
    }
    return { patched, total: poems.length };
  },
});
