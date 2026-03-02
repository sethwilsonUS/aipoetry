import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { STYLES } from './stylesConfig';

const MODEL = 'anthropic/claude-opus-4-6';
const TEMPERATURE = 1.0;

type InitResult =
  | { success: true; poemId: string }
  | { success: false; error: string };

// Fast mutation: rate-limit check → create pending poem → schedule background generation.
// Returns the poemId immediately so the client can navigate before AI generation begins.
export const initAndSchedule = mutation({
  args: {
    topic: v.string(),
    styleName: v.string(),
    artStyle: v.string(),
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
          "You may generate a maximum of five poems per day. If you're feeling plucky, you can grab a random poem (or three) while you wait!",
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

    const prompt = `Write a poem about "${args.topic}" in ${style.description}.

Guidelines:
- Approach the topic from an unexpected or surprising angle — not the first thing that comes to mind
- Use specific, concrete imagery and sensory details
- Avoid clichés (moonlight, whispers, gentle breezes, aching hearts, etc.)
- Let the form's constraints serve the meaning — don't just fill in the structure mechanically
- Give the poem a poetic, evocative title — not just "The ${args.topic}"
- No blank lines between stanzas

Return your response as JSON in this exact format:
{"title": "The Title", "lines": ["line 1", "line 2", ...]}

The lines array should have at most ${style.numberOfLines} lines.`;

    const hasImage = args.artStyle !== 'none';

    const poemId = await ctx.db.insert('poems', {
      title: '',
      lines: [],
      styleName: args.styleName,
      topicId,
      prompt,
      model: MODEL,
      temperature: TEMPERATURE,
      status: 'generating',
      isPublic: args.isPublic,
      artStyle: args.artStyle,
      imageStatus: hasImage ? 'pending' : undefined,
    });

    // Schedule the generation action to run immediately in the background.
    // The client navigates to /poems/[poemId] while this runs asynchronously.
    await ctx.scheduler.runAfter(0, internal.generate.runGeneration, {
      poemId,
      prompt,
      artStyle: args.artStyle,
    });

    return { success: true, poemId };
  },
});
