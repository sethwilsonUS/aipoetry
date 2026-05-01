import { describe, expect, it } from 'vitest';
import { analyzePoem } from '../analyzePoem';
import { detectPossibleVolta, detectRepeatedLines, extractEndWord } from '../lineFeatures';
import { compareRhyme, getRhymeLabels, scoreScheme } from '../rhyme';
import { countLineSyllables, countWordSyllables } from '../syllables';

describe('poetry analysis utilities', () => {
  it('counts word and line syllables approximately', () => {
    expect(countWordSyllables('autumn')).toBe(2);
    expect(countWordSyllables('stone')).toBe(1);
    expect(countLineSyllables('brown leaves collect by the stone')).toBe(8);
  });

  it('extracts end words and repeated lines', () => {
    expect(extractEndWord('The rain returns.')).toBe('returns');
    expect(
      detectRepeatedLines(['Do not go gentle', 'the night arrives', 'Do not go gentle']),
    ).toEqual([{ normalizedLine: 'do not go gentle', occurrences: [1, 3] }]);
  });

  it('detects approximate rhyme relationships and schemes', () => {
    expect(compareRhyme('bright', 'night')).toBe('likely');
    expect(compareRhyme('stone', 'stone')).toBe('exact');
    expect(getRhymeLabels(['bright', 'day', 'night', 'gray'])).toEqual(['A', 'B', 'A', 'B']);
    expect(scoreScheme(['A', 'B', 'A', 'B'], 'ABAB')).toBe(100);
  });

  it('finds likely volta markers', () => {
    expect(detectPossibleVolta(['The morning opens', 'But evening changes everything'])).toBe(2);
  });
});

describe('form-specific verse analysis', () => {
  it('analyzes a near haiku and a broken haiku', () => {
    const good = analyzePoem({
      styleName: 'haiku',
      lines: [
        'Autumn rain returns',
        'brown leaves gather by the stone',
        'cold river carries',
      ],
    });
    expect(good.checks.find((check) => check.id === 'line_count')?.status).toBe('pass');
    expect(good.checks.find((check) => check.id === 'haiku_syllable_tradition')?.status).not.toBe('fail');

    const englishHaiku = analyzePoem({
      styleName: 'haiku',
      lines: ['cold rain collects', 'one clear drop spills from the bell', 'ringing as it falls'],
    });
    expect(englishHaiku.checks.find((check) => check.id === 'haiku_syllable_tradition')?.status).toBe('unknown');
    expect(englishHaiku.failureModes).not.toContain('syllable_count_drift');

    const broken = analyzePoem({
      styleName: 'haiku',
      lines: ['Autumn rain returns', 'brown leaves collect by the stone'],
    });
    expect(broken.failureModes).toContain('wrong_line_count');
  });

  it('analyzes limerick rhyme and length checks', () => {
    const report = analyzePoem({
      styleName: 'limerick',
      lines: [
        'There once was a coder from Clyde',
        'Whose loops took a curious ride',
        'They spun through the night',
        'Then learned to indent right',
        'And shipped with a wink and some pride',
      ],
    });
    expect(report.checks.find((check) => check.id === 'rhyme_scheme')?.status).toBe('pass');
  });

  it('analyzes sonnet line count, rhyme, and volta checks', () => {
    const report = analyzePoem({
      styleName: 'english sonnet',
      lines: [
        'The careful window measures out the day',
        'A kettle counts the thunder in the rain',
        'The table keeps its little debts of gray',
        'While spoons arrange a parliament of pain',
        'The lamp remembers every borrowed room',
        'The hallway folds its letters into night',
        'A cup becomes a planet under bloom',
        'And dust rehearses briefly how to light',
        'But now the drawer gives back a hidden thread',
        'A small bright proof the house was not alone',
        'The silence lifts its face from under bread',
        'And names the ache the walls had made their own',
        'So what was lost returns by being said',
        'A door kept shut becomes a door instead',
      ],
    });
    expect(report.checks.find((check) => check.id === 'line_count')?.status).toBe('pass');
    expect(report.checks.find((check) => check.id === 'volta')?.status).not.toBe('fail');
    expect(report.detectedFeatures.rhymeScheme).toBeTruthy();
  });

  it('analyzes villanelle refrain positions', () => {
    const report = analyzePoem({
      styleName: 'villanelle',
      lines: [
        'The clock keeps salt beside the door',
        'The rain writes silver on the pane',
        'I leave my name and ask for more',
        'The cupboards hum beneath the floor',
        'Their hinges learn a patient strain',
        'The clock keeps salt beside the door',
        'A kettle darkens at the core',
        'The spoons assemble after rain',
        'I leave my name and ask for more',
        'Each room invents another shore',
        'The windows answer with a stain',
        'The clock keeps salt beside the door',
        'The bread remembers what it bore',
        'The knife lies bright and almost plain',
        'I leave my name and ask for more',
        'So evening counts what morning wore',
        'And turns the handle once again',
        'The clock keeps salt beside the door',
        'I leave my name and ask for more',
      ],
    });
    expect(report.checks.find((check) => check.id === 'villanelle_refrains')?.status).toBe('pass');
  });

  it('analyzes sestina end-word rotation', () => {
    const words = ['time', 'stone', 'light', 'rain', 'field', 'fire'];
    const pattern = [
      [1, 2, 3, 4, 5, 6],
      [6, 1, 5, 2, 4, 3],
      [3, 6, 4, 1, 2, 5],
      [5, 3, 2, 6, 1, 4],
      [4, 5, 1, 3, 6, 2],
      [2, 4, 6, 5, 3, 1],
    ];
    const lines = pattern.flatMap((stanza) =>
      stanza.map((position, index) => `The stanza ${index + 1} returns to ${words[position - 1]}`),
    );
    lines.push('Between time and stone I carry light');
    lines.push('Through rain and field I shelter fire');
    lines.push('The last bright door remembers time');

    const report = analyzePoem({ styleName: 'sestina', lines });
    expect(report.checks.find((check) => check.id === 'sestina_end_words')?.status).toBe('pass');
  });

  it('analyzes terza rima, blank verse, couplets, and alliterative verse', () => {
    const terza = analyzePoem({
      styleName: 'terza rima',
      lines: [
        'The stair descends toward borrowed light',
        'A lantern trembles in the stone',
        'The river answers under night',
        'A guide speaks softly from the bone',
        'The city opens into flame',
        'Each gate remembers what was known',
        'The ash repeats a vanished name',
        'The road bends back through human dust',
        'And mercy walks beside the flame',
      ],
    });
    expect(terza.checks.find((check) => check.id === 'line_count')?.status).toBe('pass');

    const blank = analyzePoem({
      styleName: 'blank verse',
      lines: Array.from({ length: 10 }, (_, index) =>
        `The measured house considers line ${index + 1}`,
      ),
    });
    expect(blank.checks.find((check) => check.id === 'line_count')?.status).toBe('pass');

    const couplets = analyzePoem({
      styleName: 'iambic pentameter couplets',
      lines: [
        'The baker knows the gossip of the bread',
        'And charges extra when the rumors spread',
        'The tailor nods at everyone in town',
        'Then hems their virtues carefully down',
        'The clerk records each noble little lie',
        'And files it where the parish moths can fly',
        'The host pours ale and calls the ledger fair',
        'While hiding half the silver under stair',
        'So pilgrims laugh beneath a borrowed name',
        'And every road arrives a little lame',
      ],
    });
    expect(couplets.checks.find((check) => check.id === 'line_count')?.status).toBe('pass');

    const alliterative = analyzePoem({
      styleName: 'alliterative verse',
      lines: Array.from({ length: 10 }, () => 'Bright blade, breaks black battle'),
    });
    expect(alliterative.checks.find((check) => check.id === 'alliterative_structure')?.status).toBe('pass');
  });

  it('returns a stable low-confidence report for unsupported forms', () => {
    const report = analyzePoem({ styleName: 'future form', lines: ['One line appears'] });
    expect(report.confidence).toBe('low');
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    for (const check of report.checks) {
      expect(check.id).toBeTruthy();
      expect(check.label).toBeTruthy();
      expect(check.status).toBeTruthy();
      expect(typeof check.score).toBe('number');
      expect(check.explanation).toBeTruthy();
    }
  });
});
