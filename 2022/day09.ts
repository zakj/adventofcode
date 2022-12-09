import { example, load, solve } from 'lib/advent';
import { Dir, move, Point, PointSet } from 'lib/coords';

type Move = { dir: Dir; count: number };
const dirMap = {
  U: Dir.Up,
  D: Dir.Down,
  L: Dir.Left,
  R: Dir.Right,
};

function parse(lines: string[]): Move[] {
  return lines.map((line) => {
    const words = line.split(' ');
    return { dir: dirMap[words[0]], count: Number(words[1]) };
  });
}

const exampleData = parse(load('ex').lines);
example.equal(13, tailVisits(exampleData, 2));
example.equal(1, tailVisits(exampleData, 10));

function tailVisits(moves: Move[], n: number): number {
  const seen = new PointSet();
  const knots: Point[] = Array(n).fill({ x: 0, y: 0 });
  seen.add(knots[0]);

  for (const { dir, count } of moves) {
    for (let i = 0; i < count; ++i) {
      knots[0] = move(knots[0], dir);
      for (let k = 1; k < knots.length; ++k) {
        const head = knots[k - 1];
        let tail = knots[k];
        if (Math.abs(head.x - tail.x) < 2 && Math.abs(head.y - tail.y) < 2)
          continue;
        if (head.x !== tail.x)
          tail = move(tail, head.x > tail.x ? Dir.Right : Dir.Left);
        if (head.y !== tail.y)
          tail = move(tail, head.y > tail.y ? Dir.Down : Dir.Up);
        knots[k] = tail;
      }
      seen.add(knots[knots.length - 1]);
    }
  }

  return seen.size;
}

const data = parse(load().lines);
export default solve(
  () => tailVisits(data, 2),
  () => tailVisits(data, 10)
).expect(6271, 2458);
