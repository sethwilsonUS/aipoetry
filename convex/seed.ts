import { mutation } from './_generated/server';

const INITIAL_STYLES = [
  {
    name: 'limerick',
    description: 'a traditional Irish limerick',
    userExplanation:
      'A limerick is a five-line poem with a strict rhyme scheme (AABBA). The first, second, and fifth lines have three stresses, while the third and fourth lines have two. Limericks are often humorous and sometimes bawdy.',
    numberOfLines: 5,
  },
  {
    name: 'sonnet',
    description:
      'a Shakespearean sonnet. The first quatrain should introduce a question or problem, the second quatrain should expand on it, the third quatrain should resolve it, and the final couplet should provide a conclusion.',
    userExplanation:
      'A sonnet is a 14-line poem with a strict rhyme scheme (ABABCDCDEFEFGG). The first 12 lines are divided into three quatrains, while the final two lines form a rhyming couplet. Sonnets are often used to explore themes of love, beauty, and mortality.',
    numberOfLines: 14,
  },
  {
    name: 'haiku',
    description:
      "a traditional Japanese haiku. Please don't feel the need to use the word \"whisper\" in every one of these :)",
    userExplanation:
      'A haiku is a three-line poem with a strict syllable count (5-7-5). Haikus often focus on nature and the changing seasons, and are intended to evoke a sense of wonder and contemplation.',
    numberOfLines: 3,
  },
  {
    name: 'alliterative verse',
    description:
      '10 lines of alliterative verse consisting of four stressed syllables per line in the style of Beowulf and other Old English poetry (note that not every word in the line need alliterate; prefer sense and overall poetic flow over alliteration)',
    userExplanation:
      'Alliterative verse is a form of poetry that relies on the repetition of initial consonant sounds to create rhythm and structure. This style was popular in Old English and Middle English poetry, and is often associated with epic narratives and heroic themes.',
    numberOfLines: 10,
  },
  {
    name: 'terza rima',
    description: '9 lines (three stanzas) terza rima poetry in the style of Dante',
    userExplanation:
      'Terza rima is a form of poetry that uses a three-line stanza with a rhyme scheme (ABA BCB CDC). This style was popularized by the Italian poet Dante Alighieri in his Divine Comedy, and is often used to explore themes of sin, redemption, and the afterlife.',
    numberOfLines: 9,
  },
  {
    name: 'blank verse',
    description: "a 10-line poem in blank verse in the style of Milton's Paradise Lost",
    userExplanation:
      'Blank verse is a form of poetry that uses unrhymed lines of iambic pentameter. This style was popularized by the English poet John Milton in his epic poem Paradise Lost, and is often used to explore complex themes and ideas.',
    numberOfLines: 10,
  },
  {
    name: 'iambic pentameter couplets',
    description:
      '10 lines of iambic pentameter in couplets in the style of Chaucer and the Canterbury Tales prologue',
    userExplanation:
      'Iambic pentameter is a form of poetry that uses lines of five iambs (unstressed/stressed syllable pairs). This style is often used in English poetry and drama, and is associated with the works of William Shakespeare and other Renaissance writers.',
    numberOfLines: 10,
  },
  {
    name: 'villanelle',
    description:
      'a villanelle with 19 lines: five tercets followed by a quatrain, with two refrains (A1 and A2) and a specific rhyme scheme (A1bA2 abA1 abA2 abA1 abA2 abA1A2)',
    userExplanation:
      "A villanelle is a 19-line poem with two repeating rhymes and two refrains. The form is known for its repetitive quality and circular structure. Famous examples include Dylan Thomas's \"Do not go gentle into that good night.\"",
    numberOfLines: 19,
  },
];

export const seedStyles = mutation({
  args: {},
  handler: async (ctx) => {
    const existingStyles = await ctx.db.query('styles').collect();

    if (existingStyles.length > 0) {
      return { message: 'Styles already seeded', count: existingStyles.length };
    }

    for (const style of INITIAL_STYLES) {
      await ctx.db.insert('styles', style);
    }

    return { message: 'Styles seeded successfully', count: INITIAL_STYLES.length };
  },
});
