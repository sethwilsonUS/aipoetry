import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { ANALYSIS_VERSION, analyzePoem } from '../src/lib/poetry/analyzePoem';
import { STYLES } from './stylesConfig';

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

/**
 * One-time migration: analyze completed poems for the current verse-analysis
 * version. Existing current-version rows are skipped unless force is true.
 *
 * Run from the Convex dashboard via:
 *   npx convex run --no-push migrations:backfillVerseAnalyses
 */
export const backfillVerseAnalyses = internalMutation({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const poems = await ctx.db.query('poems').collect();
    let analyzed = 0;
    let skipped = 0;

    for (const poem of poems) {
      if (poem.status !== 'complete') {
        skipped++;
        continue;
      }

      const existing = await ctx.db
        .query('poemAnalyses')
        .withIndex('by_poem_version', (q) =>
          q.eq('poemId', poem._id).eq('analysisVersion', ANALYSIS_VERSION),
        )
        .unique();

      if (existing && !args.force) {
        skipped++;
        continue;
      }

      const style = STYLES.find((candidate) => candidate.name === poem.styleName);
      const report = analyzePoem({
        title: poem.title,
        lines: poem.lines,
        styleName: poem.styleName,
        styleExplanation: style?.userExplanation,
      });

      const payload = {
        poemId: poem._id,
        analysisVersion: ANALYSIS_VERSION,
        styleName: poem.styleName,
        model: poem.model,
        overallScore: report.overallScore,
        summary: report.summary,
        failureModes: report.failureModes,
        confidence: report.confidence,
        reportJson: JSON.stringify(report),
        createdAt: Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, payload);
      } else {
        await ctx.db.insert('poemAnalyses', payload);
      }

      analyzed++;
    }

    return { analyzed, skipped, total: poems.length, analysisVersion: ANALYSIS_VERSION };
  },
});
