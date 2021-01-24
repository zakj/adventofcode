import { answers, example, load } from './advent';
import { combinations, permutations } from './util';

type Point = { x: number; y: number };
type PointHash = string;
type TwoPointHash = string;
const pointHash = (p: Point): PointHash => [p.x, p.y].join(',');
const distanceHash = (a: Point, b: Point): TwoPointHash =>
  [a, b].map(pointHash).join('|');

type Map = {
  start: Point;
  goals: Point[];
  walls: Set<PointHash>;
};

function parse(lines: string[]): Map {
  const map: Map = { start: null, goals: [], walls: new Set() };
  lines.forEach((line, row) => {
    line.split('').forEach((c, col) => {
      const point = { x: col, y: row };
      if (c === '0') map.start = point;
      else if (c === '#') map.walls.add(pointHash(point));
      else if (c.match(/\d/)) map.goals.push(point);
    });
  });
  return map;
}

function neighbors(p: Point, map: Map): Point[] {
  return [-1, 1]
    .flatMap((d) => [
      { x: p.x + d, y: p.y },
      { x: p.x, y: p.y + d },
    ])
    .filter((p) => !map.walls.has(pointHash(p)));
}

function shortestPath(map: Map, start: Point, goal: Point): number {
  const visited = new Set<PointHash>();
  const q: [number, Point][] = [[0, start]];
  while (q.length) {
    const [steps, cur] = q.shift();
    if (pointHash(cur) === pointHash(goal)) return steps;
    for (const neighbor of neighbors(cur, map)) {
      const hash = pointHash(neighbor);
      if (visited.has(hash)) continue;
      visited.add(hash);
      q.push([steps + 1, neighbor]);
    }
  }
}

function solve(map: Map, returnToStart = false): number {
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

const exampleMap = parse(load(24, 'ex').lines);
example.equal(solve(exampleMap), 14);

const map = parse(load(24).lines);
answers(
  () => solve(map),
  () => solve(map, true)
);
