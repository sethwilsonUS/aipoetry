import { normalizeWord } from './syllables';

export type RhymeStrength = 'exact' | 'likely' | 'slant' | 'none';

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function rhymeKey(word: string): string {
  const normalized = normalizeWord(word);
  if (normalized.length <= 3) return normalized;

  const vowelMatches = Array.from(normalized.matchAll(/[aeiouy]+/g));
  if (vowelMatches.length === 0) return normalized.slice(-3);

  const lastVowel = vowelMatches[vowelMatches.length - 1];
  return normalized.slice(lastVowel.index);
}

export function compareRhyme(a: string, b: string): RhymeStrength {
  const left = normalizeWord(a);
  const right = normalizeWord(b);
  if (!left || !right) return 'none';
  if (left === right) return 'exact';

  const leftKey = rhymeKey(left);
  const rightKey = rhymeKey(right);
  if (leftKey && leftKey === rightKey) return 'likely';
  if (left.slice(-3) === right.slice(-3)) return 'likely';
  if (left.slice(-2) === right.slice(-2)) return 'slant';
  return 'none';
}

export function getRhymeLabels(endWords: string[]): string[] {
  const groups: string[] = [];

  return endWords.map((word) => {
    const existingIndex = groups.findIndex((groupWord) => compareRhyme(word, groupWord) !== 'none');
    if (existingIndex >= 0) {
      return LABELS[existingIndex] ?? '?';
    }

    groups.push(word);
    return LABELS[groups.length - 1] ?? '?';
  });
}

export function formatRhymeScheme(labels: string[], groupSizes: number[] = []): string {
  if (groupSizes.length === 0) return labels.join('');

  const groups: string[] = [];
  let cursor = 0;
  for (const size of groupSizes) {
    groups.push(labels.slice(cursor, cursor + size).join(''));
    cursor += size;
  }
  if (cursor < labels.length) groups.push(labels.slice(cursor).join(''));
  return groups.filter(Boolean).join(' ');
}

export function scoreScheme(observedLabels: string[], expectedScheme: string): number {
  const expected = expectedScheme.replace(/\s+/g, '').split('');
  if (observedLabels.length === 0 || expected.length === 0) return 0;

  const limit = Math.min(observedLabels.length, expected.length);
  let matchingRelations = 0;
  let relationCount = 0;

  for (let i = 0; i < limit; i++) {
    for (let j = i + 1; j < limit; j++) {
      const expectedSame = expected[i] === expected[j];
      const observedSame = observedLabels[i] === observedLabels[j];
      if (expectedSame === observedSame) matchingRelations++;
      relationCount++;
    }
  }

  const relationScore = relationCount === 0 ? 0 : matchingRelations / relationCount;
  const lengthPenalty = Math.abs(observedLabels.length - expected.length) * 8;
  return Math.max(0, Math.round(relationScore * 100 - lengthPenalty));
}
