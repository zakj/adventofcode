import { example, load, solve } from '../advent';
import { sum, zip } from '../util';

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
  return s.split(',') as Direction[];
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

example.equal(distanceFromStart(walk(parse('ne,ne,ne')).pop()), 3);
example.equal(distanceFromStart(walk(parse('ne,ne,sw,sw')).pop()), 0);
example.equal(distanceFromStart(walk(parse('ne,ne,s,s')).pop()), 2);
example.equal(distanceFromStart(walk(parse('se,sw,se,sw,sw')).pop()), 3);

const directions = parse(load().raw.trim());
export default solve(
  () => distanceFromStart(walk(directions).pop()),
  () =>
    walk(directions)
      .map((x) => distanceFromStart(x))
      .reduce((max, d) => (d > max ? d : max))
).expect(784, 1558);
