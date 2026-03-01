'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import Anthropic from '@anthropic-ai/sdk';
import { tryParseJson, tryParsePartialJson } from '../src/lib/poemParsing';

const MODEL = 'claude-sonnet-4-20250514';
const TEMPERATURE = 0.9;

// Internal action — called by the scheduler from initAndSchedule mutation.
// Runs in the background while the client is already watching the poem page.
export const runGeneration = internalAction({
  args: {
    poemId: v.id('poems'),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const anthropic = new Anthropic();

    try {
      let fullResponse = '';

      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 1024,
        temperature: TEMPERATURE,
        messages: [{ role: 'user', content: args.prompt }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullResponse += event.delta.text;

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

