const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pause = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

export {
  randomInt,
  pause,
}