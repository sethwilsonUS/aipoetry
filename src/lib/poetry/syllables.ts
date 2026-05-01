const EXCEPTIONS: Record<string, number> = {
  are: 1,
  being: 2,
  every: 2,
  fire: 1,
  hour: 1,
  poetry: 3,
  poem: 2,
  poems: 2,
  quiet: 2,
  rhythm: 2,
  through: 1,
  while: 1,
};

export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/['’]s$/, '')
    .replace(/[^a-z]/g, '');
}

export function countWordSyllables(word: string): number {
  const normalized = normalizeWord(word);
  if (!normalized) return 0;
  if (EXCEPTIONS[normalized]) return EXCEPTIONS[normalized];

  let working = normalized;
  if (
    working.length > 3 &&
    working.endsWith('e') &&
    !working.endsWith('le') &&
    !working.endsWith('ue')
  ) {
    working = working.slice(0, -1);
  }

  const groups = working.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 1;

  if (normalized.endsWith('ia') || normalized.endsWith('io')) {
    count += 1;
  }
  if (normalized.endsWith('ed') && !/[td]ed$/.test(normalized) && count > 1) {
    count -= 1;
  }

  return Math.max(1, count);
}

export function countLineSyllables(line: string): number {
  return line
    .split(/\s+/)
    .map(countWordSyllables)
    .reduce((total, count) => total + count, 0);
}
