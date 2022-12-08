import { example, load, solve } from 'lib/advent';
import { parseGrid, Point, PointGrid } from 'lib/coords';
import { iter } from 'lib/iter';

function parse(lines: string[]) {
  return lines;
}

function isVisible(map: PointGrid<number>, x: number, y: number): boolean {
  const val = map.get(x, y);
  return (
    iter(map.xs)
      .filter((px) => px < x)
      .every((px) => map.get(px, y) < val) ||
    iter(map.xs)
      .filter((px) => px > x)
      .every((px) => map.get(px, y) < val) ||
    iter(map.ys)
      .filter((py) => py < y)
      .every((py) => map.get(x, py) < val) ||
    iter(map.ys)
      .filter((py) => py > y)
      .every((py) => map.get(x, py) < val)
  );
}

function visibleTrees(map: PointGrid<number>): number {
  const xs = map.xs;
  const ys = map.ys;
  let count = 0;
  for (const x of xs) {
    for (const y of ys) {
      if (isVisible(map, x, y)) count++;
    }
  }
  return count;
}

function getVisibleTrees(map: PointGrid<number>): Point[] {
  const xs = map.xs;
  const ys = map.ys;
  const points = [];
  for (const x of xs) {
    for (const y of ys) {
      if (isVisible(map, x, y)) points.push({ x, y });
    }
  }
  return points;
}

function scenicScore(map: PointGrid<number>, x: number, y: number): number {
  const val = map.get(x, y);
  // console.log({ val });
  let score = 1;

  let lscore = 0;
  let a = map.xs.filter((px) => px < x).reverse();
  for (let i = 0; i < a.length; ++i) {
    const v = map.get(a[i], y);
    lscore += 1;
    if (v >= val) break;
  }
  // console.log(' ', lscore);
  score *= lscore;

  lscore = 0;
  a = map.ys.filter((py) => py < y).reverse();
  for (let i = 0; i < a.length; ++i) {
    const v = map.get(x, a[i]);
    lscore += 1;
    if (v >= val) break;
  }
  // console.log(' ', lscore);
  score *= lscore;

  lscore = 0;
  a = map.xs.filter((px) => px > x);
  for (let i = 0; i < a.length; ++i) {
    const v = map.get(a[i], y);
    lscore += 1;
    if (v >= val) break;
  }
  // console.log(' ', lscore);
  score *= lscore;

  lscore = 0;
  a = map.ys.filter((py) => py > y);
  for (let i = 0; i < a.length; ++i) {
    const v = map.get(x, a[i]);
    lscore += 1;
    if (v >= val) break;
  }
  // console.log(' ', lscore);
  score *= lscore;

  return score;
}

function maxScenicScore(map: PointGrid<number>): number {
  let max = -Infinity;
  for (const x of map.xs) {
    for (const y of map.ys) {
      const score = scenicScore(map, x, y);
      max = Math.max(score, max);
    }
  }
  return max;
}

const exampleData = parseGrid(
  ['30373', '25512', '65332', '33549', '35390'],
  Number
);
example.equal(21, visibleTrees(exampleData));
example.equal(8, maxScenicScore(exampleData));

// console.log(scenicScore(exampleData, 2, 1));

const data = parseGrid(load().lines, Number);
export default solve(
  () => visibleTrees(data),
  () => maxScenicScore(data)
).expect(1763, 671160);
