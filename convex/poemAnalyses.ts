import { internalMutation, mutation } from './_generated/server';
import { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { ANALYSIS_VERSION, analyzePoem } from '../src/lib/poetry/analyzePoem';
import { STYLES } from './stylesConfig';

async function analyzeAndStorePoem(ctx: MutationCtx, poemId: Id<'poems'>) {
  const poem = await ctx.db.get(poemId);
  if (!poem || poem.status !== 'complete') {
    return { success: false as const, error: 'Poem is not complete.' };
  }

  const style = STYLES.find((candidate) => candidate.name === poem.styleName);
  const report = analyzePoem({
    title: poem.title,
    lines: poem.lines,
    styleName: poem.styleName,
    styleExplanation: style?.userExplanation,
  });

  const existing = await ctx.db
    .query('poemAnalyses')
    .withIndex('by_poem_version', (q) =>
      q.eq('poemId', poemId).eq('analysisVersion', ANALYSIS_VERSION),
    )
    .unique();

  const payload = {
    poemId,
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
    return { success: true as const, analysisId: existing._id };
  }

  const analysisId = await ctx.db.insert('poemAnalyses', payload);
  return { success: true as const, analysisId };
}

export const analyzeAndStore = internalMutation({
  args: {
    poemId: v.id('poems'),
  },
  handler: async (ctx, args) => {
    return analyzeAndStorePoem(ctx, args.poemId);
  },
});

export const requestAnalysis = mutation({
  args: {
    poemId: v.id('poems'),
  },
  handler: async (ctx, args) => {
    return analyzeAndStorePoem(ctx, args.poemId);
  },
});

export const clearForPoem = internalMutation({
  args: {
    poemId: v.id('poems'),
  },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query('poemAnalyses')
      .filter((q) => q.eq(q.field('poemId'), args.poemId))
      .collect();

    for (const analysis of analyses) {
      await ctx.db.delete(analysis._id);
    }
  },
});
