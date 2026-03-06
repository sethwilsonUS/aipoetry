import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { STYLES } from './stylesConfig';

const MODEL = 'anthropic/claude-opus-4-6';
const TEMPERATURE = 1.0;

type MutationResult =
  | { success: true; poemId: string }
  | { success: false; error: string };

function buildPrompt(topic: string, style: (typeof STYLES)[number]): string {
  return `Write a poem about "${topic}" in ${style.description}.

Guidelines:
- Approach the topic from an unexpected or surprising angle — not the first thing that comes to mind
- Use specific, concrete imagery and sensory details
- Avoid clichés (moonlight, whispers, gentle breezes, aching hearts, etc.)
- Let the form's constraints serve the meaning — don't just fill in the structure mechanically
- Give the poem a poetic, evocative title — not just "The ${topic}"
- No blank lines between stanzas

Return your response as JSON in this exact format:
{"title": "The Title", "lines": ["line 1", "line 2", ...]}

The lines array should have at most ${style.numberOfLines} lines.`;
}

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

    const prompt = buildPrompt(args.topic, style);

    const poemId = await ctx.db.insert('poems', {
      title: '',
      lines: [],
      styleName: args.styleName,
      topicId,
      prompt,
      model: MODEL,
      temperature: TEMPERATURE,
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

    const prompt = buildPrompt(newTopic, style);

    await ctx.db.patch(args.poemId, {
      title: '',
      lines: [],
      styleName: newStyleName,
      topicId: newTopicId,
      prompt,
      model: MODEL,
      temperature: TEMPERATURE,
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
