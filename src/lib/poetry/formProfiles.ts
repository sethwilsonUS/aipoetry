import {
  AnalysisContext,
  AnalysisStatus,
  FormProfile,
  PoetryFailureMode,
  ProfileAnalysis,
  VerseAnalysisCheck,
} from './analysisTypes';
import {
  detectSemanticPadding,
  hasVoltaMarkerNear,
  normalizeLine,
  tokenize,
} from './lineFeatures';
import { formatRhymeScheme, scoreScheme } from './rhyme';

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function statusFromScore(score: number): AnalysisStatus {
  if (score >= 90) return 'pass';
  if (score >= 55) return 'partial';
  return 'fail';
}

function makeCheck(
  id: string,
  label: string,
  score: number,
  expected: string,
  observed: string,
  explanation: string,
  evidence?: string[],
): VerseAnalysisCheck {
  const normalizedScore = clampScore(score);
  return {
    id,
    label,
    status: statusFromScore(normalizedScore),
    score: normalizedScore,
    expected,
    observed,
    explanation,
    evidence,
  };
}

function lineCountCheck(actual: number, expected: number): VerseAnalysisCheck {
  const distance = Math.abs(actual - expected);
  const score = distance === 0 ? 100 : Math.max(0, 100 - distance * 25);
  return makeCheck(
    'line_count',
    'Line count',
    score,
    `${expected} lines`,
    `${actual} lines`,
    distance === 0
      ? 'The poem matches the expected line count.'
      : 'The poem appears to miss the expected visible shape of the form.',
  );
}

function haikuSyllableTraditionCheck(counts: number[]): VerseAnalysisCheck {
  const expected = [5, 7, 5];
  const observed = counts.slice(0, expected.length);
  const isExact = expected.every((target, index) => observed[index] === target);
  const isNear = expected.every((target, index) => Math.abs((observed[index] ?? 0) - target) <= 1);

  return {
    id: 'haiku_syllable_tradition',
    label: '5-7-5 tradition note',
    status: isExact ? 'pass' : 'unknown',
    score: isExact ? 100 : isNear ? 85 : 75,
    expected: '5/7/5 is traditional in Japanese haiku, but not required for English haiku',
    observed: observed.join('/'),
    explanation: isExact
      ? 'This English haiku happens to echo the traditional 5-7-5 count.'
      : 'English haiku often does not follow 5-7-5; the analyzer records syllables without treating drift as a formal failure.',
  };
}

function syllableRangeCheck(
  counts: number[],
  min: number,
  max: number,
  id = 'meter_proxy',
  label = 'Meter proxy',
): VerseAnalysisCheck {
  const scores = counts.map((count) => {
    if (count >= min && count <= max) return 100;
    const drift = count < min ? min - count : count - max;
    return Math.max(0, 100 - drift * 25);
  });
  const score = scores.length
    ? scores.reduce((sum, value) => sum + value, 0) / scores.length
    : 0;
  return makeCheck(
    id,
    label,
    score,
    `${min}-${max} syllables per line`,
    counts.join(', '),
    'This is an approximate syllable-based proxy for meter, not full scansion.',
  );
}

function rhymeSchemeCheck(
  labels: string[],
  expected: string,
  groupSizes: number[],
  label = 'Rhyme scheme',
): VerseAnalysisCheck {
  const score = scoreScheme(labels, expected);
  return makeCheck(
    'rhyme_scheme',
    label,
    score,
    expected,
    formatRhymeScheme(labels, groupSizes),
    score >= 90
      ? 'The detected end-rhyme relationships appear to match the requested scheme.'
      : 'The detected rhyme relationships only partially match the requested scheme.',
  );
}

function unrhymedCheck(labels: string[]): VerseAnalysisCheck {
  const repeated = labels.length - new Set(labels).size;
  const score = repeated === 0 ? 100 : Math.max(0, 100 - repeated * 25);
  return makeCheck(
    'unrhymed_lines',
    'Unrhymed line endings',
    score,
    'little to no patterned end rhyme',
    repeated === 0 ? 'no repeated rhyme labels' : `${repeated} repeated rhyme labels`,
    'Blank verse should feel metrical without settling into a strong end-rhyme pattern.',
  );
}

function voltaCheck(lines: string[], expectedLine: number, id = 'volta'): VerseAnalysisCheck {
  const found = hasVoltaMarkerNear(lines, expectedLine, 2);
  return makeCheck(
    id,
    'Possible volta',
    found ? 80 : 35,
    `turn near line ${expectedLine}`,
    found ? 'turn marker nearby' : 'no clear marker nearby',
    found
      ? 'A rhetorical turn marker appears near the expected position.'
      : 'The analyzer did not find a clear rhetorical turn marker near the expected position.',
  );
}

function conciseImageCheck(lines: string[]): VerseAnalysisCheck {
  const text = lines.join(' ').toLowerCase();
  const concreteMarkers = [
    'rain',
    'leaf',
    'snow',
    'stone',
    'field',
    'river',
    'wind',
    'light',
    'bird',
    'dust',
    'flower',
    'grass',
    'water',
  ];
  const abstractMarkers = ['soul', 'heart', 'dream', 'eternity', 'love', 'truth', 'destiny'];
  const concrete = concreteMarkers.filter((word) => text.includes(word)).length;
  const abstract = abstractMarkers.filter((word) => text.includes(word)).length;
  const score = clampScore(65 + concrete * 10 - abstract * 8);
  return makeCheck(
    'image_concision',
    'Image-based compression',
    score,
    'brief concrete images',
    concrete ? `${concrete} concrete image cue(s)` : 'few concrete image cues',
    'This heuristic looks for concise sensory anchoring; it cannot judge haiku depth by itself.',
  );
}

function limerickLineLengthCheck(counts: number[]): VerseAnalysisCheck {
  const longLines = [counts[0], counts[1], counts[4]].filter((count) => count >= 7 && count <= 10).length;
  const shortLines = [counts[2], counts[3]].filter((count) => count >= 5 && count <= 7).length;
  const score = ((longLines + shortLines) / 5) * 100;
  return makeCheck(
    'limerick_line_lengths',
    'Limerick line lengths',
    score,
    'lines 1/2/5 longer, lines 3/4 shorter',
    counts.slice(0, 5).join(', '),
    'The analyzer checks the expected long/short line contrast as a rough meter proxy.',
  );
}

function refrainCheck(lines: string[]): VerseAnalysisCheck {
  const normalized = lines.map(normalizeLine);
  const a1 = normalized[0] ?? '';
  const a2 = normalized[2] ?? '';
  const a1Positions = [0, 5, 11, 17];
  const a2Positions = [2, 8, 14, 18];
  const matches = [
    ...a1Positions.map((index) => normalized[index] === a1 && Boolean(a1)),
    ...a2Positions.map((index) => normalized[index] === a2 && Boolean(a2)),
  ].filter(Boolean).length;
  const score = (matches / 8) * 100;
  return makeCheck(
    'villanelle_refrains',
    'Villanelle refrains',
    score,
    'line 1 at 6/12/18 and line 3 at 9/15/19',
    `${matches} of 8 expected refrain placements`,
    'The analyzer checks exact normalized refrain recurrence in the traditional positions.',
    [lines[0] ?? '', lines[2] ?? ''].filter(Boolean),
  );
}

function refrainDevelopmentCheck(lines: string[]): VerseAnalysisCheck {
  const repeated = lines.filter((line, index) => normalizeLine(line) === normalizeLine(lines[0] ?? '') && index !== 0);
  const score = repeated.length >= 3 ? 55 : 35;
  return makeCheck(
    'refrain_development',
    'Refrain development',
    score,
    'refrains gain force through context',
    repeated.length ? 'refrains repeat exactly' : 'refrains are missing or altered',
    'V1 can detect recurrence but only conservatively flags whether repeated lines risk feeling static.',
  );
}

function sestinaEndWordCheck(lines: string[]): VerseAnalysisCheck {
  const expectedPattern = [
    [1, 2, 3, 4, 5, 6],
    [6, 1, 5, 2, 4, 3],
    [3, 6, 4, 1, 2, 5],
    [5, 3, 2, 6, 1, 4],
    [4, 5, 1, 3, 6, 2],
    [2, 4, 6, 5, 3, 1],
  ];
  const endWords = lines.map((line) => {
    const words = tokenize(line);
    return words[words.length - 1] ?? '';
  });
  const base = endWords.slice(0, 6);
  let matches = 0;
  let total = 0;

  expectedPattern.forEach((pattern, stanzaIndex) => {
    pattern.forEach((basePosition, lineIndex) => {
      const actual = endWords[stanzaIndex * 6 + lineIndex];
      if (actual && actual === base[basePosition - 1]) matches++;
      total++;
    });
  });

  const envoyWords = lines.slice(36, 39).join(' ').toLowerCase();
  const envoyMatches = base.filter((word) => word && envoyWords.includes(word)).length;
  const score = ((matches + envoyMatches) / (total + 6)) * 100;

  return makeCheck(
    'sestina_end_words',
    'Sestina end-word rotation',
    score,
    'fixed six-word rotation plus envoi reuse',
    `${matches} of ${total} stanza endings, ${envoyMatches} of 6 envoi words`,
    'The analyzer compares normalized end words against the canonical sestina rotation.',
    base,
  );
}

function alliterativeStructureCheck(lines: string[]): VerseAnalysisCheck {
  const lineScores = lines.map((line) => {
    const content = tokenize(line).filter((word) => word.length > 3);
    const initials = new Map<string, number>();
    content.forEach((word) => {
      initials.set(word[0], (initials.get(word[0]) ?? 0) + 1);
    });
    const strongest = Math.max(0, ...Array.from(initials.values()));
    const hasCaesura = /[;:,]|\s--\s|\s{2,}/.test(line);
    return Math.min(100, strongest * 25 + (hasCaesura ? 25 : 0));
  });
  const score = lineScores.length
    ? lineScores.reduce((sum, value) => sum + value, 0) / lineScores.length
    : 0;
  return makeCheck(
    'alliterative_structure',
    'Alliterative structure',
    score,
    'recurring initial sounds and a mid-line pause',
    `${Math.round(score)} average structure score`,
    'This is a cautious proxy for alliterative verse, not a full stress analysis.',
  );
}

function archaicCosplayCheck(lines: string[]): VerseAnalysisCheck {
  const text = lines.join(' ').toLowerCase();
  const archaicWords = (text.match(/\b(thou|thee|thy|hath|doth|ere|oft)\b/g) ?? []).length;
  const score = archaicWords > 4 ? 45 : 85;
  return makeCheck(
    'archaic_cosplay',
    'Archaic diction risk',
    score,
    'structure over costume',
    archaicWords ? `${archaicWords} archaic diction cue(s)` : 'few archaic diction cues',
    'The check flags when old-sounding diction may be standing in for historical structure.',
  );
}

function paddingCheck(lines: string[]): VerseAnalysisCheck {
  const paddedLines = detectSemanticPadding(lines);
  return makeCheck(
    'semantic_padding',
    'Semantic padding',
    paddedLines.length ? 55 : 90,
    'specific language under constraint',
    paddedLines.length ? `${paddedLines.length} possible filler line(s)` : 'few obvious filler cues',
    'The analyzer conservatively flags common generic phrases that often prop up rhyme or meter.',
    paddedLines.slice(0, 3),
  );
}

function failureModesFromChecks(checks: VerseAnalysisCheck[]): PoetryFailureMode[] {
  const modes = new Set<PoetryFailureMode>();
  const poor = checks.filter((check) => check.status === 'fail' || check.status === 'partial');

  for (const check of poor) {
    if (check.id === 'line_count') modes.add('wrong_line_count');
    if (check.id.includes('syllable')) modes.add('syllable_count_drift');
    if (check.id === 'meter_proxy' || check.id.includes('line_lengths')) modes.add('meter_drift');
    if (check.id === 'rhyme_scheme' || check.id === 'unrhymed_lines') modes.add('rhyme_scheme_mismatch');
    if (check.id === 'villanelle_refrains') modes.add('missing_refrain');
    if (check.id === 'refrain_development') modes.add('refrain_stagnation');
    if (check.id === 'sestina_end_words') modes.add('sestina_end_word_failure');
    if (check.id === 'volta') modes.add('missing_or_weak_volta');
    if (check.id === 'semantic_padding') modes.add('semantic_padding');
    if (check.id === 'archaic_cosplay') modes.add('archaic_cosplay');
  }

  if (
    checks.some((check) => check.id === 'line_count' && check.status === 'pass') &&
    checks.some((check) => check.id !== 'line_count' && check.status === 'fail')
  ) {
    modes.add('decorative_form');
  }

  return Array.from(modes);
}

function adviceForModes(modes: PoetryFailureMode[]): string[] {
  const advice: Partial<Record<PoetryFailureMode, string>> = {
    wrong_line_count: 'Match the visible line count before tuning subtler formal effects.',
    meter_drift: 'Revise the longest and shortest lines toward the form rhythm without flattening strong images.',
    syllable_count_drift: 'Adjust line lengths cautiously; preserve concrete nouns and verbs where possible.',
    rhyme_scheme_mismatch: 'Repair end rhymes by changing syntax or image, not by adding stock filler.',
    missing_refrain: 'Restore the required refrain positions with exact or very close repeated lines.',
    refrain_stagnation: 'Let the repeated line gather new pressure from the surrounding context.',
    sestina_end_word_failure: 'Choose six strong end words and rotate them according to the sestina pattern.',
    missing_or_weak_volta: 'Add a clearer rhetorical or emotional turn at the expected hinge.',
    semantic_padding: 'Replace generic phrases with more specific sensory or argumentative detail.',
    decorative_form: 'Make the form shape the poem argument, not merely its formatting.',
    archaic_cosplay: 'Prefer alliterative structure and caesura over merely old-fashioned diction.',
  };

  return modes.map((mode) => advice[mode]).filter((item): item is string => Boolean(item));
}

function finish(checks: VerseAnalysisCheck[], extraModes: PoetryFailureMode[] = []): ProfileAnalysis {
  const modes = Array.from(new Set([...failureModesFromChecks(checks), ...extraModes]));
  return {
    checks,
    failureModes: modes.length ? modes : [],
    revisionAdvice: adviceForModes(modes),
  };
}

export const FORM_PROFILES: FormProfile[] = [
  {
    styleNames: ['haiku'],
    confidence: 'medium',
    analyze: ({ input, features }) =>
      finish([
        lineCountCheck(features.lineCount, 3),
        haikuSyllableTraditionCheck(features.syllableCounts),
        conciseImageCheck(input.lines),
      ]),
  },
  {
    styleNames: ['limerick'],
    confidence: 'medium',
    analyze: ({ features }) =>
      finish([
        lineCountCheck(features.lineCount, 5),
        rhymeSchemeCheck(features.rhymeLabels ?? [], 'AABBA', [5]),
        limerickLineLengthCheck(features.syllableCounts),
      ]),
  },
  {
    styleNames: ['english sonnet'],
    confidence: 'medium',
    analyze: ({ input, features }) =>
      finish([
        lineCountCheck(features.lineCount, 14),
        syllableRangeCheck(features.syllableCounts, 9, 11),
        rhymeSchemeCheck(features.rhymeLabels ?? [], 'ABABCDCDEFEFGG', [4, 4, 4, 2]),
        voltaCheck(input.lines, 9),
      ]),
  },
  {
    styleNames: ['italian sonnet'],
    confidence: 'medium',
    analyze: ({ input, features }) =>
      finish([
        lineCountCheck(features.lineCount, 14),
        syllableRangeCheck(features.syllableCounts, 9, 11),
        rhymeSchemeCheck(features.rhymeLabels ?? [], 'ABBAABBACDECDE', [8, 6]),
        voltaCheck(input.lines, 9),
      ]),
  },
  {
    styleNames: ['blank verse'],
    confidence: 'medium',
    analyze: ({ features }) =>
      finish([
        lineCountCheck(features.lineCount, 10),
        syllableRangeCheck(features.syllableCounts, 9, 11),
        unrhymedCheck(features.rhymeLabels ?? []),
      ]),
  },
  {
    styleNames: ['iambic pentameter couplets'],
    confidence: 'medium',
    analyze: ({ features }) =>
      finish([
        lineCountCheck(features.lineCount, 10),
        syllableRangeCheck(features.syllableCounts, 9, 11),
        rhymeSchemeCheck(features.rhymeLabels ?? [], 'AABBCCDDEE', [2, 2, 2, 2, 2], 'Couplet rhyme'),
      ]),
  },
  {
    styleNames: ['terza rima'],
    confidence: 'medium',
    analyze: ({ features }) =>
      finish([
        lineCountCheck(features.lineCount, 9),
        rhymeSchemeCheck(features.rhymeLabels ?? [], 'ABABCBCDC', [3, 3, 3]),
      ]),
  },
  {
    styleNames: ['villanelle'],
    confidence: 'medium',
    analyze: ({ features, input }) =>
      finish([
        lineCountCheck(features.lineCount, 19),
        refrainCheck(input.lines),
        rhymeSchemeCheck(features.rhymeLabels ?? [], 'ABAABAABAABAABAABAA', [3, 3, 3, 3, 3, 4]),
        refrainDevelopmentCheck(input.lines),
      ]),
  },
  {
    styleNames: ['sestina'],
    confidence: 'medium',
    analyze: ({ features, input }) =>
      finish([
        lineCountCheck(features.lineCount, 39),
        sestinaEndWordCheck(input.lines),
        paddingCheck(input.lines),
      ]),
  },
  {
    styleNames: ['alliterative verse'],
    confidence: 'low',
    analyze: ({ features, input }) =>
      finish([
        lineCountCheck(features.lineCount, 10),
        alliterativeStructureCheck(input.lines),
        archaicCosplayCheck(input.lines),
      ]),
  },
];

export function findFormProfile(styleName: string): FormProfile | undefined {
  const normalized = styleName.toLowerCase();
  return FORM_PROFILES.find((profile) =>
    profile.styleNames.some((name) => name.toLowerCase() === normalized),
  );
}

export function genericAnalysis(context: AnalysisContext): ProfileAnalysis {
  const checks = [
    makeCheck(
      'generic_line_features',
      'Basic line features',
      context.features.lineCount > 0 ? 70 : 0,
      'a non-empty poem',
      `${context.features.lineCount} lines`,
      'No form-specific profile exists yet, so this report only describes basic detected features.',
    ),
  ];

  return {
    checks,
    failureModes: context.features.lineCount > 0 ? ['unknown'] : ['wrong_line_count'],
    revisionAdvice: ['Add a form profile before treating this report as a formal evaluation.'],
    confidence: 'low',
  };
}
