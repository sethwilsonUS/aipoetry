import { DetectedPoeticFeatures } from './analysisTypes';
import { countLineSyllables, normalizeWord } from './syllables';

const VOLTA_MARKERS = new Set([
  'although',
  'but',
  'despite',
  'however',
  'nevertheless',
  'no',
  'now',
  'so',
  'still',
  'then',
  'therefore',
  'though',
  'yet',
]);

export function normalizeLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(line: string): string[] {
  return line
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
}

export function extractEndWord(line: string): string {
  const words = tokenize(line);
  return words[words.length - 1] ?? '';
}

export function detectRepeatedLines(lines: string[]): DetectedPoeticFeatures['repeatedLines'] {
  const occurrences = new Map<string, number[]>();
  lines.forEach((line, index) => {
    const normalized = normalizeLine(line);
    if (!normalized) return;
    const current = occurrences.get(normalized) ?? [];
    current.push(index + 1);
    occurrences.set(normalized, current);
  });

  return Array.from(occurrences.entries())
    .filter(([, indexes]) => indexes.length > 1)
    .map(([normalizedLine, indexes]) => ({
      normalizedLine,
      occurrences: indexes,
    }));
}

export function detectPossibleVolta(lines: string[]): number | undefined {
  for (let index = 0; index < lines.length; index++) {
    const words = tokenize(lines[index]);
    if (words.some((word) => VOLTA_MARKERS.has(word))) {
      return index + 1;
    }
  }
  return undefined;
}

export function hasVoltaMarkerNear(lines: string[], expectedLine: number, radius = 2): boolean {
  const possible = detectPossibleVolta(lines);
  return possible !== undefined && Math.abs(possible - expectedLine) <= radius;
}

export function detectSemanticPadding(lines: string[]): string[] {
  const fillerPatterns = [
    /\bin the night\b/i,
    /\bso bright\b/i,
    /\btakes flight\b/i,
    /\bheart(?:s)?\b/i,
    /\bsoul(?:s)?\b/i,
    /\bwhispers?\b/i,
    /\bgentle breeze\b/i,
  ];

  return lines.filter((line) => fillerPatterns.some((pattern) => pattern.test(line)));
}

export function buildBaseFeatures(
  lines: string[],
  rhymeLabels?: string[],
  rhymeScheme?: string,
): DetectedPoeticFeatures {
  return {
    lineCount: lines.length,
    syllableCounts: lines.map(countLineSyllables),
    endWords: lines.map(extractEndWord),
    rhymeLabels,
    rhymeScheme,
    repeatedLines: detectRepeatedLines(lines),
    possibleVoltaLine: detectPossibleVolta(lines),
  };
}
