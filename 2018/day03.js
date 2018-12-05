const { combinations, loadDay } = require('./util');

const re = /^#(\d+) @ (\d+),(\d+): (\d+)x(\d+)$/;
const input = loadDay(3).map(x => x.match(re)).map(x => ({
  id: Number(x[1]),
  x: Number(x[2]),
  y: Number(x[3]),
  w: Number(x[4]),
  h: Number(x[5]),
}));


function* coords(claim) {
  for (let x = claim.x; x < claim.x + claim.w; ++x) {
    for (let y = claim.y; y < claim.y + claim.h; ++y) {
      yield `${x},${y}`;
    }
  }
}


function part1(input) {
  const seen = new Set();
  const overlap = new Set();

  input.forEach(claim => {
    for (let c of coords(claim)) {
      if (seen.has(c)) {
        overlap.add(c);
      }
      else {
        seen.add(c);
      }
    }
  });

  return overlap.size;
}


function part2(input) {
  const claims = input.map(claim => ({id: claim.id, coords: new Set(coords(claim))}));
  for (let [a, b] of combinations(claims)) {
    if (a.overlap || b.overlap) continue;
    if ([...b.coords].some(x => a.coords.has(x))) {
      a.overlap = b.overlap = true;
    }
  }
  return claims.find(x => !x.overlap).id;
}


console.log(part1(input));
console.log(part2(input));
