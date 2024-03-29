import { main } from 'lib/advent';
import { neighbors4, Point, pointHash, PointSet } from 'lib/coords';
import { minDistance } from 'lib/graph';
import { combinations, lines, permutations } from 'lib/util';

type TwoPointHash = string;
const distanceHash = (a: Point, b: Point): TwoPointHash =>
  [a, b].map(pointHash).join('|');

type Map = {
  start: Point;
  goals: Point[];
  walls: PointSet;
};

function parse(s: string): Map {
  const map: Map = { start: null, goals: [], walls: new PointSet() };
  lines(s).forEach((line, row) => {
    line.split('').forEach((c, col) => {
      const point = { x: col, y: row };
      if (c === '0') map.start = point;
      else if (c === '#') map.walls.add(point);
      else if (c.match(/\d/)) map.goals.push(point);
    });
  });
  return map;
}

function shortestPath({ walls }: Map, start: Point, goal: Point): number {
  const edges = (cur: Point) => neighbors4(cur).filter((p) => !walls.has(p));
  return minDistance(start, pointHash, { goal, edges });
}

function clean(map: Map, returnToStart = false): number {
  const distances = new Map<TwoPointHash, number>();
  // Convert into traveling salesman problem.
  for (const [a, b] of combinations([].concat(map.start, map.goals))) {
    const hash1 = distanceHash(a, b);
    const hash2 = distanceHash(b, a);
    if (distances.has(hash1)) continue;
    const d = shortestPath(map, a, b);
    distances.set(hash1, d);
    distances.set(hash2, d);
  }
  let min = Infinity;
  for (const path of permutations(map.goals)) {
    let d = 0;
    let cur = map.start;
    for (const goal of path) {
      d += distances.get(distanceHash(cur, goal));
      cur = goal;
    }
    if (returnToStart) d += distances.get(distanceHash(cur, map.start));
    min = Math.min(min, d);
  }
  return min;
}

main(
  (s) => clean(parse(s)),
  (s) => clean(parse(s), true)
);
