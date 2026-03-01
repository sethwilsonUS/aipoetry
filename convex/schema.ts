import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  styles: defineTable({
    name: v.string(),
    description: v.string(),
    userExplanation: v.string(),
    numberOfLines: v.number(),
  }).index('by_name', ['name']),

  topics: defineTable({
    name: v.string(),
  }).index('by_name', ['name']),

  poems: defineTable({
    title: v.string(),
    lines: v.array(v.string()),
    styleId: v.id('styles'),
    topicId: v.id('topics'),
    prompt: v.string(),
    model: v.string(),
    temperature: v.number(),
    status: v.union(v.literal('generating'), v.literal('complete'), v.literal('error')),
    // Optional so existing poems without the field are treated as public (isPublic ?? true).
    isPublic: v.optional(v.boolean()),
    userId: v.optional(v.string()),
  }).index('by_status', ['status']),

  rateLimits: defineTable({
    identifier: v.string(),
    requests: v.array(v.number()),
  }).index('by_identifier', ['identifier']),
});
