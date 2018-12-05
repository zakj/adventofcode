const { loadDay } = require('./util');

const input = loadDay(1).map(Number);


function part1(input) {
  return input.reduce((acc, x) => acc + x, 0);
}


function part2(input) {
  let cur = 0;
  const seen = new Set([cur]);
  while (true) {
    for (let x of input) {
      cur += x;
      if (seen.has(cur)) return cur;
      seen.add(cur);
    }
  }
}


console.log(part1(input));
console.log(part2(input));
