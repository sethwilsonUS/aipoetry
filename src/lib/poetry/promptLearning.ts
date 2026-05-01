export type PromptGuidanceScope = 'global' | 'style';

export interface ActivePromptGuidanceInput {
  id: string;
  scope: PromptGuidanceScope;
  styleName?: string;
  version: number;
  guidanceBullets: string[];
}

export interface PromptBuildStyleInput {
  description: string;
  numberOfLines: number;
}

export interface DeepAnalysisLearningInput {
  reportJson?: string;
}

export interface PromptGuidanceSuggestion {
  summary: string;
  guidanceBullets: string[];
  evidenceSnippets: string[];
}

const THEME_GUIDANCE: Array<{
  id: string;
  patterns: RegExp[];
  guidance: string;
}> = [
  {
    id: 'meter',
    patterns: [/\bmeter\b/i, /\bmetrical\b/i, /\bpentameter\b/i, /\bsyllable/i, /\brhythm\b/i],
    guidance: 'Tighten meter and rhythm without sacrificing the poem\'s strongest images or rhetorical force.',
  },
  {
    id: 'volta',
    patterns: [/\bvolta\b/i, /\bturn\b/i, /\bpivot\b/i, /\bshift\b/i],
    guidance: 'Make the central turn explicit, consequential, and tied to the poem\'s argument.',
  },
  {
    id: 'closure',
    patterns: [/\bclosing\b/i, /\bending\b/i, /\bcouplet\b/i, /\bfinal\b/i, /\breframe\b/i],
    guidance: 'Make the ending reframe what came before rather than merely summarizing it.',
  },
  {
    id: 'rhyme',
    patterns: [/\brhyme\b/i, /\bend-?rhyme\b/i],
    guidance: 'Choose end rhymes that feel inevitable and avoid padding lines to satisfy the scheme.',
  },
  {
    id: 'imagery',
    patterns: [/\bimage\b/i, /\bimagery\b/i, /\bsensory\b/i, /\bconcrete\b/i, /\babstraction\b/i],
    guidance: 'Favor concrete sensory pressure over abstract explanation.',
  },
  {
    id: 'refrain',
    patterns: [/\brefrain\b/i, /\brepetition\b/i, /\brepeated\b/i],
    guidance: 'When the form repeats language, make each recurrence gather new pressure or meaning.',
  },
  {
    id: 'decorative_form',
    patterns: [/\bdecorative\b/i, /\bsurface\b/i, /\bshape\b/i, /\bstructure\b/i, /\bform\b/i],
    guidance: 'Let the form shape the poem\'s argument and emotional movement, not just its surface layout.',
  },
  {
    id: 'diction',
    patterns: [/\bdiction\b/i, /\btone\b/i, /\bvoice\b/i, /\bcliche/i, /\bcliché/i, /\bregister\b/i],
    guidance: 'Keep diction specific and alive; avoid stock poetic language or tonal cosplay.',
  },
];

function normalizeEvidence(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function collectReportStrings(report: unknown): string[] {
  if (!report || typeof report !== 'object') return [];
  const record = report as Record<string, unknown>;
  const fields = [
    record.formalReading,
    record.imageryAndVoice,
    record.overallAssessment,
    ...(Array.isArray(record.weaknesses) ? record.weaknesses : []),
    ...(Array.isArray(record.revisionPriorities) ? record.revisionPriorities : []),
  ];

  return fields
    .filter((value): value is string => typeof value === 'string')
    .map(normalizeEvidence)
    .filter(Boolean);
}

function parseReportStrings(input: DeepAnalysisLearningInput): string[] {
  if (!input.reportJson) return [];
  try {
    return collectReportStrings(JSON.parse(input.reportJson));
  } catch {
    return [];
  }
}

export function buildPoemPrompt(
  topic: string,
  style: PromptBuildStyleInput,
  activeGuidance: ActivePromptGuidanceInput[] = [],
): string {
  const guidanceBullets = activeGuidance.flatMap((guidance) => guidance.guidanceBullets);
  const approvedGuidance = guidanceBullets.length
    ? `\n\nApproved prompt guidance from prior critiques:\n${guidanceBullets
        .map((bullet) => `- ${bullet}`)
        .join('\n')}`
    : '';

  return `Write a poem about "${topic}" in ${style.description}.

Guidelines:
- Approach the topic from an unexpected or surprising angle — not the first thing that comes to mind
- Use specific, concrete imagery and sensory details
- Avoid clichés (moonlight, whispers, gentle breezes, aching hearts, etc.)
- Let the form's constraints serve the meaning — don't just fill in the structure mechanically
- Give the poem a poetic, evocative title — not just "The ${topic}"
- No blank lines between stanzas${approvedGuidance}

Return your response as JSON in this exact format:
{"title": "The Title", "lines": ["line 1", "line 2", ...]}

The lines array should have at most ${style.numberOfLines} lines.`;
}

export function buildPromptGuidanceVersion(
  basePromptVersion: string,
  activeGuidance: ActivePromptGuidanceInput[] = [],
): string {
  const highestGuidanceVersion = activeGuidance.reduce(
    (highest, guidance) => Math.max(highest, guidance.version),
    0,
  );

  return highestGuidanceVersion > 0
    ? `${basePromptVersion}+guidance-v${highestGuidanceVersion}`
    : basePromptVersion;
}

export function summarizePromptGuidanceFromDeepReports(
  analyses: DeepAnalysisLearningInput[],
  scopeLabel: string,
): PromptGuidanceSuggestion {
  const strings = analyses.flatMap(parseReportStrings);
  const themeCounts = THEME_GUIDANCE.map((theme) => {
    const evidence = strings.filter((text) =>
      theme.patterns.some((pattern) => pattern.test(text)),
    );
    return { ...theme, count: evidence.length, evidence };
  })
    .filter((theme) => theme.count > 0)
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  const selectedThemes = themeCounts.slice(0, 4);
  const guidanceBullets = selectedThemes.map((theme) => theme.guidance);
  const evidenceSnippets = selectedThemes.flatMap((theme) =>
    theme.evidence.slice(0, 2).map((text) => `[${theme.id}] ${text.slice(0, 280)}`),
  );

  return {
    summary: selectedThemes.length
      ? `${scopeLabel}: ${selectedThemes
          .map((theme) => `${theme.id} (${theme.count})`)
          .join(', ')}.`
      : `${scopeLabel}: no recurring deep-analysis themes were detected.`,
    guidanceBullets,
    evidenceSnippets,
  };
}
