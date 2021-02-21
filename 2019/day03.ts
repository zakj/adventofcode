import { answers, load } from '../advent';
import { XMap, XSet } from '../util';

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

type Point = { x: number; y: number };
type PointHash = string;
const h = ({ x, y }: Point): PointHash => `${x},${y}`;

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

function path(wire: Wire): XMap<Point, number> {
  const path = new XMap<Point, number>(h);
  const cur = { x: 0, y: 0 };
  let steps = 1;
  for (const move of wire) {
    const d = deltas[move.dir];
    for (let i = 0; i < move.dist; ++i) {
      cur.x += d.x;
      cur.y += d.y;
      if (!path.has(cur)) path.set(cur, steps);
      ++steps;
    }
  }
  return path;
}

function closestIntersectionByDistance(wires: Wire[]) {
  const pointsA = new XSet(h, path(wires[0]).keys());
  const pointsB = new XSet(h, path(wires[1]).keys());
  const intersections = pointsA.intersect(pointsB);
  return [...intersections]
    .map((p) => Math.abs(p.x) + Math.abs(p.y))
    .reduce((min, p) => (p < min ? p : min));
}

function closestIntersectionBySteps(wires: Wire[]) {
  const pathA = path(wires[0]);
  const pathB = path(wires[1]);
  const pointsA = new XSet(h, pathA.keys());
  const pointsB = new XSet(h, pathB.keys());
  const intersections = pointsA.intersect(pointsB);
  return [...intersections]
    .map((p) => pathA.get(p) + pathB.get(p))
    .reduce((min, p) => (p < min ? p : min));
}

const wires = parse(load(3).lines);
answers.expect(280, 10554);
answers(
  () => closestIntersectionByDistance(wires),
  () => closestIntersectionBySteps(wires)
);
