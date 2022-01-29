import { load, solve } from '../advent';
import { add, PointMap, PointSet } from '../coords';

enum Dir {
  L = 'L',
  R = 'R',
  U = 'U',
  D = 'D',
}
interface Move {
  dir: Dir;
  dist: number;
}
type Wire = Move[];

function parse(lines: string[]): Wire[] {
  return lines.map((line) => {
    return line.split(',').map((move) => {
      const [dir, ...dist] = move.split('');
      return { dir, dist: Number(dist.join('')) } as Move;
    });
  });
}

const deltas: Record<Dir, { x: number; y: number }> = {
  [Dir.L]: { x: -1, y: 0 },
  [Dir.R]: { x: 1, y: 0 },
  [Dir.U]: { x: 0, y: -1 },
  [Dir.D]: { x: 0, y: 1 },
};

function path(wire: Wire): PointMap<number> {
  const path = new PointMap<number>();
  let cur = { x: 0, y: 0 };
  let steps = 1;
  for (const move of wire) {
    const d = deltas[move.dir];
    for (let i = 0; i < move.dist; ++i) {
      cur = add(cur, d);
      if (!path.has(cur)) path.set(cur, steps);
      ++steps;
    }
  }
  return path;
}

function closestIntersectionByDistance(wires: Wire[]): number {
  const pointsA = new PointSet(path(wires[0]).keys());
  const pointsB = new PointSet(path(wires[1]).keys());
  const intersections = pointsA.intersect(pointsB);
  return [...intersections]
    .map((p) => Math.abs(p.x) + Math.abs(p.y))
    .reduce((min, p) => (p < min ? p : min));
}

function closestIntersectionBySteps(wires: Wire[]) {
  const pathA = path(wires[0]);
  const pathB = path(wires[1]);
  const pointsA = new PointSet(pathA.keys());
  const pointsB = new PointSet(pathB.keys());
  const intersections = pointsA.intersect(pointsB);
  return [...intersections]
    .map((p) => pathA.get(p) + pathB.get(p))
    .reduce((min, p) => (p < min ? p : min));
}

const wires = parse(load().lines);
export default solve(
  () => closestIntersectionByDistance(wires),
  () => closestIntersectionBySteps(wires)
).expect(280, 10554);
