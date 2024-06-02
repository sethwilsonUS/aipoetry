const topics = [
    'slice',
    'cows',
    'crosswords',
    'nerds',
    'prog',
    'rae_cat',
    'Rush (the band)',
    'nsfw',
    'poetry',
    'Wordle',
    'puzzles',
    'Animal Crossing',
    'Hades',
]

export const getRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex];
}