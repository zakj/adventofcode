const { loadDay } = require('./util');

input = loadDay(5)[0];


function part1(input) {
  const polymer = input.split('');
  while (true) {
    let reacted = false;
    for (i = 0; i < polymer.length - 1; ++i) {
      const [l, r] = [polymer[i], polymer[i + 1]];
      if (l.toLowerCase() === r.toLowerCase() && l !== r) {
        reacted = true;
        polymer.splice(i, 2);
      }
    }
    if (!reacted) return polymer.length;
  }
}


function part2(input) {
  const units = new Set(input.toLowerCase().split(''))
  return Array.from(units)
    .map(u => {
      const re = new RegExp(u, 'ig');
      return part1(input.replace(re, ''));
    })
    .reduce((smallest, x) => {
      return x < smallest ? x : smallest;
    }, Infinity)
}


console.log(part1(input));
console.log(part2(input));
