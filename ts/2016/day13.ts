import { main } from 'lib/advent';
import { neighbors4, Point, pointHash, PointMap, PointSet } from 'lib/coords';
import { minDistance } from 'lib/graph';
import { allNumbers } from 'lib/util';

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
  const edges = (cur: Point) => neighbors(cur, n);
  return minDistance(start, pointHash, { goal, edges });
}

function mostVisitedIn(goal: number, n: number): number {
  let cur: Point = { x: 1, y: 1 };
  const q = [cur];
  const pathTo = new PointMap<Point[]>([[cur, []]]);
  while (q.length > 0) {
    cur = q.shift();
    const path = pathTo.get(cur);
    if (path.length === goal) return new PointSet(pathTo.keys()).size;
    for (const neighbor of neighbors(cur, n)) {
      const to = pathTo.get(neighbor);
      if (!to) {
        pathTo.set(neighbor, path.concat(cur));
        q.push(neighbor);
      }
    }
  }
  throw 'no path';
}

main(
  (s) => shortestPathTo({ x: 31, y: 39 }, allNumbers(s)[0]),
  (s) => mostVisitedIn(50, allNumbers(s)[0])
);
