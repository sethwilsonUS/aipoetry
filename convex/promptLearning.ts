import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { Id } from './_generated/dataModel';
import {
  ActivePromptGuidanceInput,
  PromptGuidanceScope,
  summarizePromptGuidanceFromDeepReports,
} from '../src/lib/poetry/promptLearning';

const PROMPT_LEARNING_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

type CandidateStatus = 'pending' | 'approved' | 'rejected';

type PromptLearningResult =
  | { success: true; candidateId: Id<'promptImprovementCandidates'> }
  | { success: false; error: string };

function cooldownKey(scope: PromptGuidanceScope, styleName?: string): string {
  return scope === 'global' ? 'global' : `style:${styleName ?? ''}`;
}

function scopeLabel(scope: PromptGuidanceScope, styleName?: string): string {
  return scope === 'global' ? 'Global prompt guidance' : `${styleName} prompt guidance`;
}

function candidateBrief(candidate: {
  _id: Id<'promptImprovementCandidates'>;
  scope: PromptGuidanceScope;
  styleName?: string;
  status: CandidateStatus;
  summary: string;
  guidanceBullets: string[];
  sourceCount: number;
  createdAt: number;
}): string {
  const scope = candidate.scope === 'global' ? 'global' : `style:${candidate.styleName}`;
  return [
    `${candidate._id}: ${candidate.status} ${scope}`,
    `Sources: ${candidate.sourceCount}`,
    `Summary: ${candidate.summary}`,
    `Guidance: ${candidate.guidanceBullets.join(' | ') || 'none'}`,
  ].join('\n');
}

async function getCompletedDeepAnalysesForScope(
  ctx: MutationCtx | QueryCtx,
  scope: PromptGuidanceScope,
  styleName?: string,
) {
  const completed = await ctx.db
    .query('poemDeepAnalyses')
    .withIndex('by_status', (q) => q.eq('status', 'complete'))
    .collect();

  const eligible = [];
  for (const analysis of completed) {
    if (!analysis.reportJson) continue;

    if (scope === 'style') {
      const poem = await ctx.db.get(analysis.poemId);
      if (!poem || poem.styleName !== styleName) continue;
    }

    eligible.push(analysis);
  }

  return eligible.sort((a, b) => (b.completedAt ?? b.updatedAt) - (a.completedAt ?? a.updatedAt));
}

export const getActivePromptGuidanceForStyle = internalQuery({
  args: {
    styleName: v.string(),
  },
  handler: async (ctx, args): Promise<ActivePromptGuidanceInput[]> => {
    const activeGlobal = await ctx.db
      .query('activePromptGuidance')
      .withIndex('by_scope_active', (q) => q.eq('scope', 'global').eq('isActive', true))
      .collect();
    const activeStyle = await ctx.db
      .query('activePromptGuidance')
      .withIndex('by_style_active', (q) => q.eq('styleName', args.styleName).eq('isActive', true))
      .collect();

    return [...activeGlobal, ...activeStyle]
      .sort((a, b) => {
        if (a.scope !== b.scope) return a.scope === 'global' ? -1 : 1;
        return a.version - b.version;
      })
      .map((guidance) => ({
        id: guidance._id,
        scope: guidance.scope,
        styleName: guidance.styleName,
        version: guidance.version,
        guidanceBullets: guidance.guidanceBullets,
      }));
  },
});

export const proposePromptImprovements = internalMutation({
  args: {
    scope: v.union(v.literal('global'), v.literal('style')),
    styleName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PromptLearningResult> => {
    if (args.scope === 'style' && !args.styleName) {
      return { success: false, error: 'styleName is required for style-scoped candidates.' };
    }

    const now = Date.now();
    const key = cooldownKey(args.scope, args.styleName);
    const recentCandidate = await ctx.db
      .query('promptImprovementCandidates')
      .withIndex('by_cooldown', (q) => q.eq('cooldownKey', key))
      .collect()
      .then((candidates) =>
        candidates.find((candidate) => candidate.createdAt > now - PROMPT_LEARNING_COOLDOWN_MS),
      );

    if (recentCandidate) {
      return {
        success: false,
        error: `A ${key} candidate already exists inside the 14-day cooldown window: ${recentCandidate._id}.`,
      };
    }

    const analyses = await getCompletedDeepAnalysesForScope(ctx, args.scope, args.styleName);
    if (analyses.length === 0) {
      return { success: false, error: 'No completed deep analyses are available for this scope.' };
    }

    const suggestion = summarizePromptGuidanceFromDeepReports(
      analyses.map((analysis) => ({ reportJson: analysis.reportJson ?? '' })),
      scopeLabel(args.scope, args.styleName),
    );

    if (suggestion.guidanceBullets.length === 0) {
      return {
        success: false,
        error: 'Completed deep analyses did not contain enough recognizable themes for a candidate.',
      };
    }

    const candidateId = await ctx.db.insert('promptImprovementCandidates', {
      scope: args.scope,
      styleName: args.scope === 'style' ? args.styleName : undefined,
      cooldownKey: key,
      status: 'pending',
      summary: suggestion.summary,
      guidanceBullets: suggestion.guidanceBullets,
      evidenceSnippets: suggestion.evidenceSnippets,
      sourceAnalysisIds: analyses.map((analysis) => analysis._id),
      sourceCount: analyses.length,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, candidateId };
  },
});

export const listPromptImprovementCandidates = internalQuery({
  args: {
    status: v.optional(v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected'))),
    scope: v.optional(v.union(v.literal('global'), v.literal('style'))),
    styleName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const candidates = await ctx.db.query('promptImprovementCandidates').collect();
    const filtered = candidates
      .filter((candidate) => !args.status || candidate.status === args.status)
      .filter((candidate) => !args.scope || candidate.scope === args.scope)
      .filter((candidate) => !args.styleName || candidate.styleName === args.styleName)
      .sort((a, b) => b.createdAt - a.createdAt);

    return filtered.map((candidate) => ({
      id: candidate._id,
      scope: candidate.scope,
      styleName: candidate.styleName ?? null,
      status: candidate.status,
      sourceCount: candidate.sourceCount,
      summary: candidate.summary,
      guidanceBullets: candidate.guidanceBullets,
      evidenceSnippets: candidate.evidenceSnippets,
      createdAt: candidate.createdAt,
      brief: candidateBrief(candidate),
    }));
  },
});

export const approvePromptImprovement = internalMutation({
  args: {
    candidateId: v.id('promptImprovementCandidates'),
    approvedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) {
      return { success: false as const, error: 'Candidate not found.' };
    }
    if (candidate.status !== 'pending') {
      return { success: false as const, error: 'Only pending candidates can be approved.' };
    }

    const now = Date.now();
    const allGuidance = await ctx.db.query('activePromptGuidance').collect();
    const version = allGuidance.reduce((highest, guidance) => Math.max(highest, guidance.version), 0) + 1;

    const activeForScope = allGuidance.filter((guidance) => {
      if (!guidance.isActive || guidance.scope !== candidate.scope) return false;
      if (candidate.scope === 'global') return true;
      return guidance.styleName === candidate.styleName;
    });

    for (const guidance of activeForScope) {
      await ctx.db.patch(guidance._id, {
        isActive: false,
        deactivatedAt: now,
      });
    }

    const activeGuidanceId = await ctx.db.insert('activePromptGuidance', {
      scope: candidate.scope,
      styleName: candidate.styleName,
      sourceCandidateId: candidate._id,
      version,
      guidanceBullets: candidate.guidanceBullets,
      isActive: true,
      activatedAt: now,
      activatedBy: args.approvedBy,
    });

    await ctx.db.patch(candidate._id, {
      status: 'approved',
      approvedAt: now,
      approvedBy: args.approvedBy,
      updatedAt: now,
    });

    return { success: true as const, activeGuidanceId, version };
  },
});

export const rejectPromptImprovement = internalMutation({
  args: {
    candidateId: v.id('promptImprovementCandidates'),
    rejectedBy: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) {
      return { success: false as const, error: 'Candidate not found.' };
    }
    if (candidate.status !== 'pending') {
      return { success: false as const, error: 'Only pending candidates can be rejected.' };
    }

    const now = Date.now();
    await ctx.db.patch(candidate._id, {
      status: 'rejected',
      rejectedAt: now,
      rejectedBy: args.rejectedBy,
      rejectedReason: args.reason,
      updatedAt: now,
    });

    return { success: true as const, candidateId: candidate._id };
  },
});

export const getPromptLearningBrief = internalQuery({
  args: {
    scope: v.union(v.literal('global'), v.literal('style')),
    styleName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const key = cooldownKey(args.scope, args.styleName);
    const now = Date.now();
    const completedAnalyses = await getCompletedDeepAnalysesForScope(ctx, args.scope, args.styleName);
    const candidates = await ctx.db
      .query('promptImprovementCandidates')
      .withIndex('by_cooldown', (q) => q.eq('cooldownKey', key))
      .collect();
    const pending = candidates.filter((candidate) => candidate.status === 'pending');
    const newestCandidate = candidates.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
    const cooldownEndsAt = newestCandidate
      ? newestCandidate.createdAt + PROMPT_LEARNING_COOLDOWN_MS
      : null;
    const activeGuidance =
      args.scope === 'global'
        ? await ctx.db
            .query('activePromptGuidance')
            .withIndex('by_scope_active', (q) => q.eq('scope', 'global').eq('isActive', true))
            .collect()
        : await ctx.db
            .query('activePromptGuidance')
            .withIndex('by_style_active', (q) =>
              q.eq('styleName', args.styleName).eq('isActive', true),
            )
            .collect();

    return {
      scope: args.scope,
      styleName: args.styleName ?? null,
      completedDeepAnalysisCount: completedAnalyses.length,
      pendingCandidateCount: pending.length,
      cooldownActive: cooldownEndsAt !== null && cooldownEndsAt > now,
      cooldownEndsAt,
      activeGuidance: activeGuidance.map((guidance) => ({
        id: guidance._id,
        version: guidance.version,
        guidanceBullets: guidance.guidanceBullets,
        activatedAt: guidance.activatedAt,
      })),
      summary: [
        `${scopeLabel(args.scope, args.styleName)}`,
        `Completed deep analyses: ${completedAnalyses.length}`,
        `Pending candidates: ${pending.length}`,
        `Cooldown: ${cooldownEndsAt && cooldownEndsAt > now ? `active until ${new Date(cooldownEndsAt).toISOString()}` : 'open'}`,
        `Active guidance: ${activeGuidance.length ? activeGuidance.map((g) => `v${g.version}`).join(', ') : 'none'}`,
      ].join('\n'),
    };
  },
});
