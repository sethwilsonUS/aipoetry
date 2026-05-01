import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  topics: defineTable({
    name: v.string(),
  }).index('by_name', ['name']),

  poems: defineTable({
    title: v.string(),
    lines: v.array(v.string()),
    styleName: v.string(),
    topicId: v.id('topics'),
    prompt: v.string(),
    model: v.string(),
    modelProvider: v.optional(v.string()),
    gatewayModelId: v.optional(v.string()),
    generationPromptVersion: v.optional(v.string()),
    systemPromptVersion: v.optional(v.string()),
    activePromptGuidanceIds: v.optional(v.array(v.id('activePromptGuidance'))),
    promptGuidanceVersion: v.optional(v.string()),
    generatedAt: v.optional(v.number()),
    temperature: v.number(),
    status: v.union(v.literal('generating'), v.literal('complete'), v.literal('error')),
    isPublic: v.optional(v.boolean()),
    userId: v.optional(v.string()),
    artStyle: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    imageDescription: v.optional(v.string()),
    imageStatus: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('generating'),
        v.literal('complete'),
        v.literal('error'),
      ),
    ),
  }).index('by_status', ['status']),

  poemAnalyses: defineTable({
    poemId: v.id('poems'),
    analysisVersion: v.string(),
    styleName: v.string(),
    model: v.string(),
    overallScore: v.number(),
    summary: v.string(),
    failureModes: v.array(v.string()),
    confidence: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    reportJson: v.string(),
    createdAt: v.number(),
  })
    .index('by_poem_version', ['poemId', 'analysisVersion'])
    .index('by_style', ['styleName'])
    .index('by_model', ['model'])
    .index('by_created_at', ['createdAt']),

  poemDeepAnalyses: defineTable({
    poemId: v.id('poems'),
    analysisVersion: v.string(),
    model: v.string(),
    modelProvider: v.optional(v.string()),
    gatewayModelId: v.optional(v.string()),
    promptVersion: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('generating'),
      v.literal('complete'),
      v.literal('error'),
    ),
    reportJson: v.optional(v.string()),
    error: v.optional(v.string()),
    requestedAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index('by_poem_version', ['poemId', 'analysisVersion'])
    .index('by_status', ['status'])
    .index('by_model', ['model']),

  promptImprovementCandidates: defineTable({
    scope: v.union(v.literal('global'), v.literal('style')),
    styleName: v.optional(v.string()),
    cooldownKey: v.string(),
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
    summary: v.string(),
    guidanceBullets: v.array(v.string()),
    evidenceSnippets: v.array(v.string()),
    sourceAnalysisIds: v.array(v.id('poemDeepAnalyses')),
    sourceCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.string()),
    rejectedAt: v.optional(v.number()),
    rejectedBy: v.optional(v.string()),
    rejectedReason: v.optional(v.string()),
  })
    .index('by_status', ['status'])
    .index('by_cooldown', ['cooldownKey', 'createdAt'])
    .index('by_scope_status', ['scope', 'status'])
    .index('by_style_status', ['styleName', 'status']),

  activePromptGuidance: defineTable({
    scope: v.union(v.literal('global'), v.literal('style')),
    styleName: v.optional(v.string()),
    sourceCandidateId: v.id('promptImprovementCandidates'),
    version: v.number(),
    guidanceBullets: v.array(v.string()),
    isActive: v.boolean(),
    activatedAt: v.number(),
    deactivatedAt: v.optional(v.number()),
    activatedBy: v.optional(v.string()),
  })
    .index('by_scope_active', ['scope', 'isActive'])
    .index('by_style_active', ['styleName', 'isActive'])
    .index('by_version', ['version']),

  rateLimits: defineTable({
    identifier: v.string(),
    requests: v.array(v.number()),
  }).index('by_identifier', ['identifier']),
});
