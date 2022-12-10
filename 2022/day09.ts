import { example, load, solve } from 'lib/advent';
import { Dir, move, Point, pointHash } from 'lib/coords';
import { iter, range } from 'lib/iter';

const dirMap = {
  U: Dir.Up,
  D: Dir.Down,
  L: Dir.Left,
  R: Dir.Right,
};

function parse(lines: string[]): Dir[] {
  return lines.flatMap((line) => {
    const [dir, count] = line.split(' ');
    return Array(Number(count)).fill(dirMap[dir]);
  });
}

function follow(tail: Point, head: Point): Point {
  const dx = head.x - tail.x;
  const dy = head.y - tail.y;
  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return tail;
  return { x: tail.x + Math.sign(dx), y: tail.y + Math.sign(dy) };
}

function tailVisits(moves: Dir[], n: number): number {
  const start: Point = { x: 0, y: 0 };
  const headVisits = iter(moves).scan(move, start);
  return range(1, n)
    .reduce((visits) => visits.scan(follow, start), headVisits)
    .uniqBy(pointHash).size;
}

const exampleData = parse(load('ex').lines);
example.equal(13, tailVisits(exampleData, 2));
example.equal(1, tailVisits(exampleData, 10));

const data = parse(load().lines);
export default solve(
  () => tailVisits(data, 2),
  () => tailVisits(data, 10)
).expect(6271, 2458);
