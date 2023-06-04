const tileData = {
  a: { quantity: 9, value: 1 },
  b: { quantity: 2, value: 3 },
  c: { quantity: 2, value: 3 },
  d: { quantity: 4, value: 2 },
  e: { quantity: 12, value: 1 },
  f: { quantity: 2, value: 4 },
  g: { quantity: 3, value: 2 },
  h: { quantity: 2, value: 4 },
  i: { quantity: 9, value: 1 },
  j: { quantity: 1, value: 8 },
  k: { quantity: 1, value: 5 },
  l: { quantity: 4, value: 1 },
  m: { quantity: 2, value: 3 },
  n: { quantity: 6, value: 1 },
  o: { quantity: 8, value: 1 },
  p: { quantity: 2, value: 3 },
  q: { quantity: 1, value: 10 },
  r: { quantity: 6, value: 1 },
  s: { quantity: 4, value: 1 },
  t: { quantity: 6, value: 1 },
  u: { quantity: 4, value: 1 },
  v: { quantity: 2, value: 4 },
  w: { quantity: 2, value: 4 },
  x: { quantity: 1, value: 8 },
  y: { quantity: 2, value: 4 },
  z: { quantity: 1, value: 10 },
  '': { quantity: 2, value: '' },
};

const specialSpaceData = {
  'dl': { color: '#b3eeff', legend: 'DOUBLE LETTER SCORE' },
  'dw': { color: '#ffb2be', legend: 'DOUBLE WORD SCORE' },
  'tl': { color: '#01bcf4', legend: 'TRIPLE LETTER SCORE' },
  'tw': { color: '#f05a62', legend: 'TRIPLE WORD SCORE' },
};

const boardData = [
  [['tw'], [], [], ['dl'], [], [], [], ['tw']],
  [[], ['dw'], [], [], [], ['tl'], [], []],
  [[], [], ['dw'], [], [], [], ['dl'], []],
  [['dl'], [], [], ['dw'], [], [], [], ['dl']],
  [[], [], [], [], ['dw'], [], [], []],
  [[], ['tl'], [], [], [], ['tl'], [], []],
  [[], [], ['dl'], [], [], [], ['dl'], []],
  [['tw'], [], [], ['dl'], [], [], [], ['dw']],
];

const expandedRows = boardData.map(row => [...row, ...row.slice(0, -1).reverse()]);
const lowerHalf = [...expandedRows.slice(0, -1)].reverse();
const fullBoard = [...expandedRows, ...lowerHalf];

export {
  tileData,
  specialSpaceData,
  fullBoard,
}