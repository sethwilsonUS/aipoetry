'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { streamText } from 'ai';
import { tryParseJson, tryParsePartialJson } from '../src/lib/poemParsing';
import { POETRY_MODEL_CONFIG, SYSTEM_PROMPT } from './poetryModelConfig';

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
        model: POETRY_MODEL_CONFIG.model,
        maxOutputTokens: POETRY_MODEL_CONFIG.maxOutputTokens,
        temperature: POETRY_MODEL_CONFIG.temperature,
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
        try {
          await ctx.runMutation(internal.poemAnalyses.analyzeAndStore, {
            poemId: args.poemId,
          });
        } catch {
          // The deterministic analysis is helpful, but generation should remain complete.
        }
      } else {
        await ctx.runMutation(internal.poems.setError, { id: args.poemId });
      }
    } catch {
      await ctx.runMutation(internal.poems.setError, { id: args.poemId });
    }
  },
});
