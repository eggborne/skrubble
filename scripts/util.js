const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pause = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
const shuffleArray = (a, b, c, d) => { c = a.length; while (c) b = Math.random() * c-- | 0, d = a[c], a[c] = a[b], a[b] = d; };
const loadFromLocalStorage = (key) => JSON.parse(localStorage.getItem(key));
const saveToLocalStorage = (key, item) => localStorage.setItem(key, typeof item === 'string' ? item : JSON.stringify(item));

export {
  randomInt,
  pause,
  shuffleArray,
  loadFromLocalStorage,
  saveToLocalStorage,
};