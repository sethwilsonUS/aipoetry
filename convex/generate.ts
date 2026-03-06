'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { streamText } from 'ai';
import { tryParseJson, tryParsePartialJson } from '../src/lib/poemParsing';

const MODEL = 'anthropic/claude-opus-4-6';
const TEMPERATURE = 1.0;

const SYSTEM_PROMPT = `You are a skilled and imaginative poet with deep knowledge of poetic traditions across cultures and eras. Your poems are distinctive and specific. You favor:
- Concrete, sensory imagery over vague abstraction
- Surprising, unexpected angles over obvious interpretations
- Genuine emotional resonance over sentimentality
- Precise language — the exact word, not the approximate one
Avoid overused poetic clichés: moonlight flooding in, whispers, gentle breezes, hearts aching, souls yearning, and similar stock phrases.`;

// Internal action — called by the scheduler from initAndSchedule mutation.
// Runs in the background while the client is already watching the poem page.
export const runGeneration = internalAction({
  args: {
    poemId: v.id('poems'),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      let fullResponse = '';

      const result = streamText({
        model: MODEL,
        maxOutputTokens: 800,
        temperature: TEMPERATURE,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: args.prompt }],
      });

      for await (const chunk of result.textStream) {
        fullResponse += chunk;

        const parsed = tryParsePartialJson(fullResponse);
        if (parsed) {
          await ctx.runMutation(internal.poems.updateContent, {
            id: args.poemId,
            title: parsed.title || '',
            lines: parsed.lines || [],
            status: 'generating',
          });
        }
      }

      const finalParsed = tryParseJson(fullResponse);
      if (finalParsed) {
        await ctx.runMutation(internal.poems.updateContent, {
          id: args.poemId,
          title: finalParsed.title || 'Untitled',
          lines: finalParsed.lines || [],
          status: 'complete',
        });
      } else {
        await ctx.runMutation(internal.poems.setError, { id: args.poemId });
      }
    } catch {
      await ctx.runMutation(internal.poems.setError, { id: args.poemId });
    }
  },
});
