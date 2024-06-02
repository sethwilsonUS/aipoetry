import { z, } from 'zod';

const styles = [
  {
    name: 'limerick',
    description: 'a traditional Irish limerick',
    explanation: 'A limerick is a five-line poem with a strict rhyme scheme (AABBA). The first, second, and fifth lines have three stresses, while the third and fourth lines have two. Limericks are often humorous and sometimes bawdy.',
    lines: 5,
  },
  {
    name: 'sonnet',
    description: 'a Shakespearean sonnet',
    explanation: 'A sonnet is a 14-line poem with a strict rhyme scheme (ABABCDCDEFEFGG). The first 12 lines are divided into three quatrains, while the final two lines form a rhyming couplet. Sonnets are often used to explore themes of love, beauty, and mortality.',
    lines: 14,
  },
  {
    name: 'haiku',
    description: 'a traditional Japanese haiku',
    explanation: 'A haiku is a three-line poem with a strict syllable count (5-7-5). Haikus often focus on nature and the changing seasons, and are intended to evoke a sense of wonder and contemplation.',
    lines: 3,
  },
]

export const getRandomStyle = () => {
  const randomIndex = Math.floor(Math.random() * styles.length);
  return styles[randomIndex];
};