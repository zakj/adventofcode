import { answers, example } from '../advent';
import { range } from '../util';

type Point = [number, number];

function isWall([x, y]: Point, n: number): boolean {
  const num = x * x + 3 * x + 2 * x * y + y + y * y + n;
  const bin = (num >>> 0).toString(2);
  return bin.split('').filter((x) => x === '1').length % 2 === 1;
}

function neighbors([x, y]: Point, n: number): Point[] {
  const points: Point[] = [-1, 1].flatMap((d) => [
    [x, y + d],
    [x + d, y],
  ]);
  return points.filter((p: Point) => !isWall(p, n) && p[0] >= 0 && p[1] >= 0);
}

const hash = (p: Point): string => p.join(',');

function shortestPathTo(goal: Point, n: number): string[] {
  let cur: Point = [1, 1];
  const q = [cur];
  const pathTo = new Map<string, string[]>([[hash(cur), []]]);
  while (q.length > 0) {
    cur = q.shift();
    const path = pathTo.get(hash(cur));
    if (cur[0] === goal[0] && cur[1] === goal[1]) return path;
    for (let neighbor of neighbors(cur, n)) {
      const to = pathTo.get(hash(neighbor));
      if (!to || to.length > path.length) {
        pathTo.set(hash(neighbor), path.concat(hash(cur)));
        q.push(neighbor);
      }
    }
  }
}

function mostVisitedIn(goal: number, n: number): string[] {
  let cur: Point = [1, 1];
  const q = [cur];
  const pathTo = new Map<string, string[]>([[hash(cur), []]]);
  while (q.length > 0) {
    cur = q.shift();
    const path = pathTo.get(hash(cur));
    if (path.length === goal) return [...pathTo.keys()];
    for (let neighbor of neighbors(cur, n)) {
      const to = pathTo.get(hash(neighbor));
      if (!to) {
        pathTo.set(hash(neighbor), path.concat(hash(cur)));
        q.push(neighbor);
      }
    }
  }
  return [];
}

function printGrid(w, h, n, path) {
  for (let y = 0; y < h; ++y) {
    console.log(
      range(0, w)
        .map((x) =>
          isWall([x, y], n) ? '#' : path.includes(hash([x, y])) ? 'O' : '.'
        )
        .join('')
    );
  }
}

example.equal(shortestPathTo([7, 4], 10).length, 11);

const faveNum = 1358;
answers.expect(96, 141);
answers(
  () => {
    const path = shortestPathTo([31, 39], 1358);
    // printGrid(40, 44, faveNum, path);
    return path.length;
  },
  () => {
    const path = mostVisitedIn(50, faveNum);
    // printGrid(30, 25, faveNum, path);
    return new Set(path).size;
  }
);
