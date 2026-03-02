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
    temperature: v.number(),
    status: v.union(v.literal('generating'), v.literal('complete'), v.literal('error')),
    isPublic: v.optional(v.boolean()),
    userId: v.optional(v.string()),
    artStyle: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    imageStatus: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('generating'),
        v.literal('complete'),
        v.literal('error'),
      ),
    ),
  }).index('by_status', ['status']),

  rateLimits: defineTable({
    identifier: v.string(),
    requests: v.array(v.number()),
  }).index('by_identifier', ['identifier']),
});
