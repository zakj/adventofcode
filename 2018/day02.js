const { combinations, hammingDistance, loadDay } = require('./util');

const input = loadDay(2);


function part1(input) {
  const counts = input.reduce((acc, id) => {
    const freq = id.split('').reduce((f, letter) => {
      if (!(letter in f)) f[letter] = 0;
      f[letter] += 1;
      return f;
    }, {});
    acc[2] += Object.values(freq).find(v => v === 2) ? 1 : 0;
    acc[3] += Object.values(freq).find(v => v === 3) ? 1 : 0;
    return acc;
  }, {2: 0, 3: 0});
  return counts[2] * counts[3];
}


function part2(input) {
  for (let [a, b] of combinations(input)) {
    if (hammingDistance(a, b) === 1) {
      for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
          const common = a.split('');
          common.splice(i, 1);
          return common.join('');
        }
      }
    }
  }
}


console.log(part1(input));
console.log(part2(input));
