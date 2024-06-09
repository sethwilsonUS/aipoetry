import { z } from 'zod';

const styles = [
  {
    name: 'limerick',
    description: 'a traditional Irish limerick',
    explanation: 'A limerick is a five-line poem with a strict rhyme scheme (AABBA). The first, second, and fifth lines have three stresses, while the third and fourth lines have two. Limericks are often humorous and sometimes bawdy.',
    lines: 5,
  },
  {
    name: 'sonnet',
    description: 'a Shakespearean sonnet. The first quatrain should introduce a question or problem, the second quatrain should expand on it, the third quatrain should resolve it, and the final couplet should provide a conclusion.',
    explanation: 'A sonnet is a 14-line poem with a strict rhyme scheme (ABABCDCDEFEFGG). The first 12 lines are divided into three quatrains, while the final two lines form a rhyming couplet. Sonnets are often used to explore themes of love, beauty, and mortality.',
    lines: 14,
  },
  {
    name: 'haiku',
    description: 'a traditional Japanese haiku. Please dont feel the need to use the word "whisper" in every one of these :)',
    explanation: 'A haiku is a three-line poem with a strict syllable count (5-7-5). Haikus often focus on nature and the changing seasons, and are intended to evoke a sense of wonder and contemplation.',
    lines: 3,
  },
  {
    name: 'alliterative verse',
    description: '10 lines of alliterative verse consisting of four stressed syllables per line in the style of Beowulf and other Old English poetry (note that not every word in the line need alliterate; prefer sense and overall poetic flow over alliteration)',
    explanation: 'Alliterative verse is a form of poetry that relies on the repetition of initial consonant sounds to create rhythm and structure. This style was popular in Old English and Middle English poetry, and is often associated with epic narratives and heroic themes.',
    lines: 10,
  },
  {
    name: 'terza rima',
    description: '9 lines (three stanzas)  terza rima poetry in the style of Dante',
    explanation: 'Terza rima is a form of poetry that uses a three-line stanza with a rhyme scheme (ABA BCB CDC). This style was popularized by the Italian poet Dante Alighieri in his Divine Comedy, and is often used to explore themes of sin, redemption, and the afterlife.',
    lines: 9,
  },
  {
    name: 'blank verse',
    description: 'a 10-line poem in blank verse in the style of Milton\'s Paradise Lost',
    explanation: 'Blank verse is a form of poetry that uses unrhymed lines of iambic pentameter. This style was popularized by the English poet John Milton in his epic poem Paradise Lost, and is often used to explore complex themes and ideas.',
    lines: 10,
  },
  {
    name: 'iambic pentameter couplets',
    description: '10 lines of iambic pentameter in couplets in the style of Chaucer and the Canterbury Tales prologue',
    explanation: 'Iambic pentameter is a form of poetry that uses lines of five iambs (unstressed/stressed syllable pairs). This style is often used in English poetry and drama, and is associated with the works of William Shakespeare and other Renaissance writers.',
    lines: 10,  
  },
]

export const getRandomStyle = () => {
  const randomIndex = Math.floor(Math.random() * styles.length);
  return styles[randomIndex];
};