import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';

const MODEL = 'claude-sonnet-4-20250514';
const TEMPERATURE = 0.9;

type InitResult =
  | { success: true; poemId: string }
  | { success: false; error: string };

// Fast mutation: rate-limit check → create pending poem → schedule background generation.
// Returns the poemId immediately so the client can navigate before AI generation begins.
export const initAndSchedule = mutation({
  args: {
    topic: v.string(),
    styleName: v.string(),
    identifier: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args): Promise<InitResult> => {
    const rateLimitResult = await ctx.runMutation(api.rateLimiter.checkRateLimit, {
      identifier: args.identifier,
    });

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error:
          "You may generate a maximum of five poems every hour. If you're feeling plucky, you can grab a random poem (or three) while you wait!",
      };
    }

    const style = await ctx.db
      .query('styles')
      .withIndex('by_name', (q) => q.eq('name', args.styleName))
      .unique();

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

    const prompt = `Write a poem about ${args.topic} in ${style.description}. Also give the poem a title.
Make sure the title is also poetic and relevant to the poem.
Also, please, no blank lines between stanzas.

Return your response as JSON in this exact format:
{"title": "The Title", "lines": ["line 1", "line 2", ...]}

The lines array should have at most ${style.numberOfLines} lines.`;

    const poemId = await ctx.db.insert('poems', {
      title: '',
      lines: [],
      styleId: style._id,
      topicId,
      prompt,
      model: MODEL,
      temperature: TEMPERATURE,
      status: 'generating',
      isPublic: args.isPublic,
    });

    // Schedule the generation action to run immediately in the background.
    // The client navigates to /poems/[poemId] while this runs asynchronously.
    await ctx.scheduler.runAfter(0, internal.generate.runGeneration, {
      poemId,
      prompt,
    });

    return { success: true, poemId };
  },
});
