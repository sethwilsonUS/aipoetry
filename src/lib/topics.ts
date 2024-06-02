const topics = [
    'cows',
    'crosswords',
    'nerds',
    'rae_cat',
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
]

export const getRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex];
}