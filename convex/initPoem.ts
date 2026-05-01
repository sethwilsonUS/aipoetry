import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { STYLES } from './stylesConfig';
import { POETRY_MODEL_CONFIG } from './poetryModelConfig';
import {
  buildPoemPrompt,
  buildPromptGuidanceVersion,
} from '../src/lib/poetry/promptLearning';

type MutationResult =
  | { success: true; poemId: string }
  | { success: false; error: string };

export const initAndSchedule = mutation({
  args: {
    topic: v.string(),
    styleName: v.string(),
    identifier: v.string(),
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    const rateLimitResult = await ctx.runMutation(api.rateLimiter.checkRateLimit, {
      identifier: args.identifier,
      kind: 'poem',
    });

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error:
          'You\u2019ve reached the daily poem limit. If you\u2019re feeling plucky, grab a random poem from the archive while you wait!',
      };
    }

    const style = STYLES.find((s) => s.name === args.styleName);
    if (!style) {
      return { success: false, error: `Style "${args.styleName}" not found` };
    }

    const existingTopic = await ctx.db
      .query('topics')
      .withIndex('by_name', (q) => q.eq('name', args.topic))
      .unique();

    const topicId = existingTopic
      ? existingTopic._id
      : await ctx.db.insert('topics', { name: args.topic });

    const activePromptGuidance = await ctx.runQuery(
      internal.promptLearning.getActivePromptGuidanceForStyle,
      {
        styleName: args.styleName,
      },
    );
    const prompt = buildPoemPrompt(args.topic, style, activePromptGuidance);
    const promptVersion = buildPromptGuidanceVersion(
      POETRY_MODEL_CONFIG.promptVersion,
      activePromptGuidance,
    );

    const poemId = await ctx.db.insert('poems', {
      title: '',
      lines: [],
      styleName: args.styleName,
      topicId,
      prompt,
      model: POETRY_MODEL_CONFIG.model,
      modelProvider: POETRY_MODEL_CONFIG.provider,
      gatewayModelId: POETRY_MODEL_CONFIG.gatewayModelId,
      generationPromptVersion: promptVersion,
      systemPromptVersion: POETRY_MODEL_CONFIG.systemPromptVersion,
      activePromptGuidanceIds: activePromptGuidance.map(
        (guidance) => guidance.id as Id<'activePromptGuidance'>,
      ),
      promptGuidanceVersion: promptVersion,
      generatedAt: Date.now(),
      temperature: POETRY_MODEL_CONFIG.temperature,
      status: 'generating',
      isPublic: false,
    });

    await ctx.scheduler.runAfter(0, internal.generate.runGeneration, {
      poemId,
      prompt,
    });

    return { success: true, poemId };
  },
});

export const regeneratePoem = mutation({
  args: {
    poemId: v.id('poems'),
    identifier: v.string(),
    topic: v.optional(v.string()),
    styleName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<MutationResult> => {
    const poem = await ctx.db.get(args.poemId);
    if (!poem) {
      return { success: false, error: 'Poem not found.' };
    }
    if (poem.isPublic === true) {
      return { success: false, error: 'Published poems cannot be regenerated.' };
    }

    const rateLimitResult = await ctx.runMutation(api.rateLimiter.checkRateLimit, {
      identifier: args.identifier,
      kind: 'poem',
    });
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'You\u2019ve reached the daily poem limit. Try again tomorrow!',
      };
    }

    const newStyleName = args.styleName ?? poem.styleName;
    const style = STYLES.find((s) => s.name === newStyleName);
    if (!style) {
      return { success: false, error: `Style "${newStyleName}" not found` };
    }

    // Resolve the topic name — use override or look up the existing one.
    let newTopic = args.topic;
    if (!newTopic) {
      const topicDoc = await ctx.db.get(poem.topicId);
      newTopic = topicDoc?.name ?? '';
    }

    let newTopicId = poem.topicId;
    if (args.topic) {
      const existingTopic = await ctx.db
        .query('topics')
        .withIndex('by_name', (q) => q.eq('name', args.topic!))
        .unique();
      newTopicId = existingTopic
        ? existingTopic._id
        : await ctx.db.insert('topics', { name: args.topic });
    }

    // Delete old image from storage if one exists.
    if (poem.imageStorageId) {
      await ctx.storage.delete(poem.imageStorageId);
    }

    await ctx.runMutation(internal.poemAnalyses.clearForPoem, {
      poemId: args.poemId,
    });
    await ctx.runMutation(internal.deepPoemAnalyses.clearForPoem, {
      poemId: args.poemId,
    });

    const activePromptGuidance = await ctx.runQuery(
      internal.promptLearning.getActivePromptGuidanceForStyle,
      {
        styleName: newStyleName,
      },
    );
    const prompt = buildPoemPrompt(newTopic, style, activePromptGuidance);
    const promptVersion = buildPromptGuidanceVersion(
      POETRY_MODEL_CONFIG.promptVersion,
      activePromptGuidance,
    );

    await ctx.db.patch(args.poemId, {
      title: '',
      lines: [],
      styleName: newStyleName,
      topicId: newTopicId,
      prompt,
      model: POETRY_MODEL_CONFIG.model,
      modelProvider: POETRY_MODEL_CONFIG.provider,
      gatewayModelId: POETRY_MODEL_CONFIG.gatewayModelId,
      generationPromptVersion: promptVersion,
      systemPromptVersion: POETRY_MODEL_CONFIG.systemPromptVersion,
      activePromptGuidanceIds: activePromptGuidance.map(
        (guidance) => guidance.id as Id<'activePromptGuidance'>,
      ),
      promptGuidanceVersion: promptVersion,
      generatedAt: Date.now(),
      temperature: POETRY_MODEL_CONFIG.temperature,
      status: 'generating',
      artStyle: undefined,
      imageStorageId: undefined,
      imageDescription: undefined,
      imageStatus: undefined,
    });

    await ctx.scheduler.runAfter(0, internal.generate.runGeneration, {
      poemId: args.poemId,
      prompt,
    });

    return { success: true, poemId: args.poemId };
  },
});
