export type StyleConfig = {
  name: string;
  description: string;
  userExplanation: string;
  numberOfLines: number;
};

export const STYLES: StyleConfig[] = [
  {
    name: 'limerick',
    description:
      'a limerick with AABBA rhyme scheme. Lines 1, 2, and 5 have three strong beats (7–10 syllables); lines 3 and 4 have two strong beats (5–7 syllables). Limericks thrive on wordplay, absurdity, and misdirection — lean into wit, a subversive scenario, or a twist. The final line should land like a punchline, ideally recontextualizing everything before it.',
    userExplanation:
      'A five-line poem with AABBA rhyme scheme. Lines 1, 2, and 5 carry three strong beats; lines 3 and 4 carry two. Limericks are traditionally witty and subversive — they reward wordplay, surprising turns, and a punchline that reframes everything.',
    numberOfLines: 5,
  },
  {
    name: 'english sonnet',
    description:
      'a Shakespearean (English) sonnet with ABABCDCDEFEFGG rhyme scheme in iambic pentameter. The first quatrain introduces a question or problem; the second quatrain deepens or complicates it; the third quatrain pivots with a volta (a turn — a shift in perspective or argument); the final rhyming couplet should surprise or reframe what came before, not merely summarize it. Shakespeare\'s mode: argumentative, rhetorical, philosophical — ideas worked through to a witty or devastating conclusion.',
    userExplanation:
      'The Shakespearean sonnet: 14 lines in iambic pentameter with ABABCDCDEFEFGG rhyme scheme. Three quatrains work through an argument, a volta (turn) shifts the perspective, and the closing couplet delivers a final word — ideally a surprise or reframing, not a summary.',
    numberOfLines: 14,
  },
  {
    name: 'italian sonnet',
    description:
      'a Petrarchan (Italian) sonnet with an octave (ABBAABBA) followed by a sestet (CDECDE or CDCDCD) in iambic pentameter. The volta — the pivotal turn — falls between the octave and sestet, and should be a hard shift: the octave establishes a tension, problem, or yearning; the sestet resolves, answers, or transforms it from a new vantage point. Petrarch\'s mode: inward, lyrical, and intense — the self in confrontation with beauty, loss, time, or the divine.',
    userExplanation:
      "The Petrarchan (Italian) sonnet: an octave (ABBAABBA) poses a tension or longing; a strong volta (turn) pivots to a sestet (CDECDE) that resolves or transforms it. Petrarch's mode is inward and lyrical — the self confronting beauty, loss, or the infinite.",
    numberOfLines: 14,
  },
  {
    name: 'haiku',
    description:
      'a traditional Japanese haiku (5-7-5 syllables). Include a kigo — a seasonal or nature word that anchors the poem in a specific time. Use kireji — a juxtaposition or cut between two distinct images, letting them resonate without explaining the connection. Capture a single, fleeting moment of direct sensory observation. Embody mono no aware: the bittersweetness of impermanence. Do not explain or moralize — trust the images to do the work.',
    userExplanation:
      'A three-line poem with 5-7-5 syllable structure rooted in Japanese tradition. A good haiku has a kigo (seasonal reference), a kireji (a juxtaposition between two images), and embodies mono no aware — the bittersweet awareness of impermanence. It observes; it does not explain.',
    numberOfLines: 3,
  },
  {
    name: 'alliterative verse',
    description:
      'ten lines of Old English alliterative verse in the style of Beowulf. Each line has four stressed syllables and a caesura (a strong pause) near the middle, dividing it into two half-lines. At least two of the four stressed syllables should alliterate. Use kennings — compressed compound metaphors (e.g. "whale-road" for the sea, "word-hoard" for vocabulary) — where they strengthen the poem. Adopt the elevated, heroic register of the genre: grand scale, fate, and the endurance of things.',
    userExplanation:
      'Old English verse in the style of Beowulf: four stressed syllables per line, a caesura (pause) in the middle, and alliteration across the half-lines. Kennings — compressed compound metaphors like "whale-road" for sea — are welcome. The register is grand, heroic, and fate-haunted.',
    numberOfLines: 10,
  },
  {
    name: 'terza rima',
    description:
      'nine lines (three stanzas) of terza rima in the style of Dante, with interlocking ABA BCB CDC rhyme scheme. The interlocking rhyme should feel like it drives the poem forward — each stanza opens a new thread from the last. Channel Dante\'s visionary imagery: dense, specific, and strange. The poem should feel like a journey through a place or idea, not a meditation on it from a distance.',
    userExplanation:
      "Three stanzas of three lines each, with Dante's interlocking ABA BCB CDC rhyme scheme. The interlock drives the poem forward like a chain. Dante's style is visionary, dense, and specific — it journeys through a world rather than reflecting on it.",
    numberOfLines: 9,
  },
  {
    name: 'blank verse',
    description:
      "ten lines of blank verse (unrhymed iambic pentameter) in the grand style of Milton's Paradise Lost. Use long syntactical arcs that spill across multiple lines (enjambment). Favor elevated, latinate diction; periodic sentences that withhold their main verb; and the sense of a vast subject being approached with deliberate weight. The subject should feel cosmically significant, even if it is small.",
    userExplanation:
      "Unrhymed iambic pentameter modeled on Milton's Paradise Lost. The hallmarks are Miltonic: long sentences that enjamb across lines, latinate vocabulary, elevated diction, and a grand sense of scale. Even a small subject gets treated with cosmic seriousness.",
    numberOfLines: 10,
  },
  {
    name: 'iambic pentameter couplets',
    description:
      "ten lines of iambic pentameter in rhyming couplets, in the witty, worldly style of Chaucer's Canterbury Tales prologue. Each couplet should be a complete, self-contained unit of thought — an observation, a judgment, or a turn of wit. Favor concrete, physical detail and the comic observation of human nature. The tone is knowing and gently satirical, not preachy.",
    userExplanation:
      "Ten lines of iambic pentameter in rhyming couplets, modeled on Chaucer's Canterbury Tales prologue. Each couplet lands as a complete observation. The mode is witty, worldly, and concrete — Chaucer's great gift was the sharp eye for human nature and the particular detail.",
    numberOfLines: 10,
  },
  {
    name: 'sestina',
    description:
      'a sestina: six 6-line stanzas followed by a 3-line envoi, for 39 lines total. Choose six end-words before you begin — they should be richly ambiguous (nouns that can function as verbs, words with multiple registers or meanings). These six words rotate through every stanza in the fixed pattern 615243 (the last word of stanza N becomes the end-words of stanza N+1 in that order). The envoi uses all six end-words, two per line (one mid-line, one at the end). The constraint should generate unexpected meaning: the same word, encountered in new contexts, accumulates new weight. The poem should feel hypnotic and inevitable, not mechanical — let the rotating words guide you toward surprising discoveries about the subject.',
    userExplanation:
      "A 39-line poem built on obsessive repetition: six end-words rotate through six stanzas in a fixed mathematical pattern, then all six appear in a closing 3-line envoi. The same words, encountered again and again in new contexts, accumulate new meaning. The effect is hypnotic — one of poetry's most demanding and rewarding forms.",
    numberOfLines: 39,
  },
  {
    name: 'villanelle',
    description:
      'a villanelle with 19 lines: five tercets (ABA) followed by a quatrain (ABAA). The first line of the first stanza (A1) and the third line of the first stanza (A2) are refrains that alternate as the closing lines of each subsequent tercet, then both appear together in the final quatrain. Crucially: the refrains should shift in meaning or emotional weight each time they return — the same words, but changed by accumulating context. Choose A1 and A2 so they can bear that weight. The obsessive, circling structure should feel earned, not mechanical.',
    userExplanation:
      "A 19-line poem with two repeating refrains, following Dylan Thomas's \"Do not go gentle\" form. Five three-line stanzas plus a four-line closing stanza. The two refrains circle back throughout — and in a great villanelle, the same words mean something different each time they return.",
    numberOfLines: 19,
  },
];
