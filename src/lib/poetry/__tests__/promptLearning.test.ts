import { describe, expect, it } from 'vitest';
import {
  ActivePromptGuidanceInput,
  buildPoemPrompt,
  buildPromptGuidanceVersion,
  summarizePromptGuidanceFromDeepReports,
} from '../promptLearning';

const style = {
  description: 'a Shakespearean sonnet',
  numberOfLines: 14,
};

describe('prompt guidance assembly', () => {
  it('preserves the base prompt when no guidance is active', () => {
    const prompt = buildPoemPrompt('a storm in a teacup', style);

    expect(prompt).toContain('Write a poem about "a storm in a teacup" in a Shakespearean sonnet.');
    expect(prompt).not.toContain('Approved prompt guidance from prior critiques');
    expect(buildPromptGuidanceVersion('poem-generation-v1')).toBe('poem-generation-v1');
  });

  it('appends global and style guidance in the provided order', () => {
    const guidance: ActivePromptGuidanceInput[] = [
      {
        id: 'global-guidance',
        scope: 'global',
        version: 1,
        guidanceBullets: ['Make endings reframe rather than summarize.'],
      },
      {
        id: 'sonnet-guidance',
        scope: 'style',
        styleName: 'english sonnet',
        version: 3,
        guidanceBullets: ['Make the volta explicit and consequential.'],
      },
    ];

    const prompt = buildPoemPrompt('a locked drawer', style, guidance);

    expect(prompt).toContain('Approved prompt guidance from prior critiques');
    expect(prompt).toContain('- Make endings reframe rather than summarize.');
    expect(prompt).toContain('- Make the volta explicit and consequential.');
    expect(buildPromptGuidanceVersion('poem-generation-v1', guidance)).toBe(
      'poem-generation-v1+guidance-v3',
    );
  });
});

describe('prompt guidance suggestions', () => {
  it('turns deep-analysis themes into generic guidance instead of poem-specific edits', () => {
    const reportJson = JSON.stringify({
      formalReading:
        'The volta arrives late, and the meter breaks in line 12 when the pentameter contract matters most.',
      weaknesses: ['The ending summarizes instead of reframing the argument.'],
      revisionPriorities: [
        'Rewrite line 12 to restore pentameter while preserving the rhetorical punch.',
      ],
    });

    const suggestion = summarizePromptGuidanceFromDeepReports(
      [{ reportJson }],
      'english sonnet prompt guidance',
    );

    expect(suggestion.guidanceBullets).toContain(
      'Tighten meter and rhythm without sacrificing the poem\'s strongest images or rhetorical force.',
    );
    expect(suggestion.guidanceBullets).toContain(
      'Make the central turn explicit, consequential, and tied to the poem\'s argument.',
    );
    expect(suggestion.guidanceBullets.join(' ')).not.toContain('line 12');
    expect(suggestion.evidenceSnippets.some((snippet) => snippet.includes('line 12'))).toBe(true);
  });
});
