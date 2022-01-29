import { example, load, solve } from 'lib/advent';
import { neighbors4, Point, pointHash, PointMap, PointSet } from 'lib/coords';
import search from 'lib/graph';

function isWall({ x, y }: Point, n: number): boolean {
  const num = x * x + 3 * x + 2 * x * y + y + y * y + n;
  const bin = (num >>> 0).toString(2);
  return bin.split('').filter((x) => x === '1').length % 2 === 1;
}

function neighbors(cur: Point, n: number) {
  return neighbors4(cur).filter(
    ({ x, y }) => x >= 0 && y >= 0 && !isWall({ x, y }, n)
  );
}

function shortestPathTo(goal: Point, n: number): number {
  const start = { x: 1, y: 1 };
  const edgeWeights = (cur: Point): [Point, number][] =>
    neighbors(cur, n).map((p) => [p, 1]);
  return search(start, goal, pointHash, edgeWeights);
}

function mostVisitedIn(goal: number, n: number): number {
  let cur: Point = { x: 1, y: 1 };
  const q = [cur];
  const pathTo = new PointMap<Point[]>([[cur, []]]);
  while (q.length > 0) {
    cur = q.shift();
    const path = pathTo.get(cur);
    if (path.length === goal) return new PointSet(pathTo.keys()).size;
    for (let neighbor of neighbors(cur, n)) {
      const to = pathTo.get(neighbor);
      if (!to) {
        pathTo.set(neighbor, path.concat(cur));
        q.push(neighbor);
      }
    }
  }
  throw 'no path';
}

example.equal(shortestPathTo({ x: 7, y: 4 }, 10), 11);

const faveNum = load().numbers[0];
export default solve(
  () => shortestPathTo({ x: 31, y: 39 }, faveNum),
  () => mostVisitedIn(50, faveNum)
).expect(96, 141);
