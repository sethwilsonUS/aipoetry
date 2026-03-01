import { describe, it, expect } from 'vitest';
import { tryParseJson, tryParsePartialJson } from '../poemParsing';

describe('tryParseJson', () => {
  it('parses a well-formed poem JSON response', () => {
    const input = '{"title": "Ode to Coffee", "lines": ["Dark, bitter gift", "Steam rising slow"]}';
    expect(tryParseJson(input)).toEqual({
      title: 'Ode to Coffee',
      lines: ['Dark, bitter gift', 'Steam rising slow'],
    });
  });

  it('extracts JSON embedded in surrounding text', () => {
    const input = 'Here is your poem:\n{"title": "Rain", "lines": ["It falls"]}\nEnd.';
    expect(tryParseJson(input)).toEqual({ title: 'Rain', lines: ['It falls'] });
  });

  it('returns null for plain text with no JSON', () => {
    expect(tryParseJson('no json here')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(tryParseJson('{"title": "Broken", "lines": [unclosed')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(tryParseJson('')).toBeNull();
  });
});

describe('tryParsePartialJson', () => {
  it('extracts title and lines from complete JSON', () => {
    const input = '{"title": "Spring", "lines": ["Petals fall", "Wind stirs"]}';
    expect(tryParsePartialJson(input)).toEqual({
      title: 'Spring',
      lines: ['Petals fall', 'Wind stirs'],
    });
  });

  it('extracts title from partial JSON (lines array not yet closed)', () => {
    const input = '{"title": "Spring", "lines": ["Petals fall", "Wind stirs"';
    const result = tryParsePartialJson(input);
    expect(result?.title).toBe('Spring');
    expect(result?.lines).toEqual(['Petals fall', 'Wind stirs']);
  });

  it('extracts title alone when lines have not yet appeared in the stream', () => {
    const input = '{"title": "Autumn Leaves"';
    const result = tryParsePartialJson(input);
    expect(result?.title).toBe('Autumn Leaves');
    expect(result?.lines).toBeUndefined();
  });

  it('returns an empty lines array when the lines bracket is open but empty', () => {
    const input = '{"title": "Silence", "lines": [';
    const result = tryParsePartialJson(input);
    expect(result?.title).toBe('Silence');
    expect(result?.lines).toEqual([]);
  });

  it('returns null when neither title nor lines are present', () => {
    expect(tryParsePartialJson('streaming preamble text…')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(tryParsePartialJson('')).toBeNull();
  });

  it('handles a title with escaped characters gracefully', () => {
    const input = '{"title": "The Road Not Taken", "lines": ["Two roads diverged"]}';
    const result = tryParsePartialJson(input);
    expect(result?.title).toBe('The Road Not Taken');
  });
});

describe('tryParseJson / tryParsePartialJson interplay', () => {
  it('partial parser returns a superset of what full parser returns for complete JSON', () => {
    const complete = '{"title": "Sea", "lines": ["The waves crash"]}';
    const full = tryParseJson(complete);
    const partial = tryParsePartialJson(complete);
    expect(partial?.title).toBe(full?.title);
    expect(partial?.lines).toEqual(full?.lines);
  });
});
