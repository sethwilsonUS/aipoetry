import { v } from 'convex/values';
import { internalMutation, internalQuery, mutation } from './_generated/server';
import { api, internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { STYLES } from './stylesConfig';
import { DEEP_ANALYSIS_MODEL_CONFIG } from './poetryModelConfig';
import { DEEP_ANALYSIS_VERSION } from '../src/lib/poetry/analysisTypes';
import { ANALYSIS_VERSION } from '../src/lib/poetry/analyzePoem';

type RequestDeepAnalysisResult =
  | { success: true; analysisId: Id<'poemDeepAnalyses'> }
  | { success: false; error: string };

export const getForDeepAnalysis = internalQuery({
  args: {
    poemId: v.id('poems'),
  },
  handler: async (ctx, args) => {
    const poem = await ctx.db.get(args.poemId);
    if (!poem) return null;

    const topic = await ctx.db.get(poem.topicId);
    const style = STYLES.find((candidate) => candidate.name === poem.styleName);
    const ruleAnalysis = await ctx.db
      .query('poemAnalyses')
      .withIndex('by_poem_version', (q) =>
        q.eq('poemId', args.poemId).eq('analysisVersion', ANALYSIS_VERSION),
      )
      .unique();

    return {
      title: poem.title,
      lines: poem.lines,
      status: poem.status,
      styleName: poem.styleName,
      styleExplanation: style?.userExplanation ?? '',
      topicName: topic?.name ?? '',
      ruleAnalysisJson: ruleAnalysis?.reportJson ?? null,
    };
  },
});

export const requestDeepAnalysis = mutation({
  args: {
    poemId: v.id('poems'),
    identifier: v.string(),
  },
  handler: async (ctx, args): Promise<RequestDeepAnalysisResult> => {
    const poem = await ctx.db.get(args.poemId);
    if (!poem) return { success: false, error: 'Poem not found.' };
    if (poem.status !== 'complete') {
      return { success: false, error: 'Poem must be complete before deep analysis.' };
    }

    const existing = await ctx.db
      .query('poemDeepAnalyses')
      .withIndex('by_poem_version', (q) =>
        q.eq('poemId', args.poemId).eq('analysisVersion', DEEP_ANALYSIS_VERSION),
      )
      .unique();

    if (existing && existing.status !== 'error') {
      return { success: true, analysisId: existing._id };
    }

    const rateLimitResult = await ctx.runMutation(api.rateLimiter.checkRateLimit, {
      identifier: args.identifier,
      kind: 'deepAnalysis',
    });
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'You have reached the daily deep analysis limit. Try again tomorrow!',
      };
    }

    const now = Date.now();
    const payload = {
      poemId: args.poemId,
      analysisVersion: DEEP_ANALYSIS_VERSION,
      model: DEEP_ANALYSIS_MODEL_CONFIG.model,
      modelProvider: DEEP_ANALYSIS_MODEL_CONFIG.provider,
      gatewayModelId: DEEP_ANALYSIS_MODEL_CONFIG.gatewayModelId,
      promptVersion: DEEP_ANALYSIS_MODEL_CONFIG.promptVersion,
      status: 'pending' as const,
      requestedAt: now,
      updatedAt: now,
    };

    const analysisId = existing
      ? existing._id
      : await ctx.db.insert('poemDeepAnalyses', payload);

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...payload,
        reportJson: undefined,
        error: undefined,
        completedAt: undefined,
      });
    }

    await ctx.scheduler.runAfter(0, internal.deepPoemAnalysisAction.runDeepAnalysis, {
      analysisId,
      poemId: args.poemId,
    });

    return { success: true, analysisId };
  },
});

export const markDeepAnalysisGenerating = internalMutation({
  args: {
    analysisId: v.id('poemDeepAnalyses'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.analysisId, {
      status: 'generating',
      updatedAt: Date.now(),
      error: undefined,
    });
  },
});

export const storeDeepAnalysis = internalMutation({
  args: {
    analysisId: v.id('poemDeepAnalyses'),
    reportJson: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.analysisId, {
      status: 'complete',
      reportJson: args.reportJson,
      error: undefined,
      updatedAt: now,
      completedAt: now,
    });
  },
});

export const setDeepAnalysisError = internalMutation({
  args: {
    analysisId: v.id('poemDeepAnalyses'),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.analysisId, {
      status: 'error',
      error: args.error,
      updatedAt: Date.now(),
    });
  },
});

export const clearForPoem = internalMutation({
  args: {
    poemId: v.id('poems'),
  },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query('poemDeepAnalyses')
      .filter((q) => q.eq(q.field('poemId'), args.poemId))
      .collect();

    for (const analysis of analyses) {
      await ctx.db.delete(analysis._id);
    }
  },
});
