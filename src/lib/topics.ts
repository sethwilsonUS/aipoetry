const topics = [
    'cows',
    'crosswords',
    'nerds',
    'Rush (the band)',
    'poetry',
    'Wordle',
    'puzzles',
    'Animal Crossing',
    'Hades',
    'The Legend of Zelda',
    'coffee',
    'tea',
    'books',
    'reading',
    'writing',
    'coding',
    'guitar',
    'flannel',
    'grunge (the music genre)',
    'rock opera',
    'corn hole',
    'raspberries',
    'pumpkins',
    'cauliflower',
    'oreo cookies',
    'wild horses',
    'waffles',
    'the game of crickt',
    'Oxford commas',
    'Oxford University',
]

export const getRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex];
}