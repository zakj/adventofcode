import { main } from 'lib/advent';
import { sum, zip } from 'lib/util';

type Direction = 'n' | 'ne' | 'se' | 's' | 'sw' | 'nw';
type Point = [x: number, y: number, z: number];

const neighborDeltas = new Map<Direction, Point>([
  ['n', [0, 1, -1]],
  ['ne', [1, 0, -1]],
  ['se', [1, -1, 0]],
  ['s', [0, -1, 1]],
  ['sw', [-1, 0, 1]],
  ['nw', [-1, 1, 0]],
]);

function parse(s: string): Direction[] {
  return s.trim().split(',') as Direction[];
}

function go(point: Point, dir: Direction): Point {
  return zip(point, neighborDeltas.get(dir)).map(sum) as Point;
}

function walk(directions: Direction[]): Point[] {
  let cur: Point = [0, 0, 0];
  const path = [cur];
  for (const dir of directions) {
    cur = go(cur, dir);
    path.push(cur);
  }
  return path;
}

function distanceFromStart(point: Point): number {
  return (Math.abs(point[0]) + Math.abs(point[1]) + Math.abs(point[2])) / 2;
}

main(
  (s) => distanceFromStart(walk(parse(s)).pop()),
  (s) =>
    walk(parse(s))
      .map((x) => distanceFromStart(x))
      .reduce((max, d) => (d > max ? d : max))
);
