const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pause = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
const shuffleArray = (a, b, c, d) => { c = a.length; while (c) b = Math.random() * c-- | 0, d = a[c], a[c] = a[b], a[b] = d; }

export {
  randomInt,
  pause,
  shuffleArray,
}