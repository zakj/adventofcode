import { example, load, solve } from 'lib/advent';
import { Dir, move, Point, PointSet } from 'lib/coords';
import { range } from 'lib/util';

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

const exampleData = parse(
  `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`.split('\n')
);
example.equal(13, part1(exampleData));
example.equal(1, part2(exampleData));

function part1(moves: Move[]): number {
  const seen = new PointSet();
  let head: Point = { x: 0, y: 0 };
  let tail: Point = { x: 0, y: 0 };
  seen.add(tail);

  for (const { dir, count } of moves) {
    for (let i = 0; i < count; ++i) {
      head = move(head, dir);

      // touching; do nothing
      if (Math.abs(head.x - tail.x) < 2 && Math.abs(head.y - tail.y) < 2)
        continue;

      // same col, move horizontally/vert if in same col/row
      if (head.y === tail.y) {
        tail = move(tail, head.x > tail.x ? Dir.Right : Dir.Left);
      } else if (head.x === tail.x) {
        tail = move(tail, head.y > tail.y ? Dir.Down : Dir.Up);
      } else {
        // diagonal
        tail = move(tail, head.x > tail.x ? Dir.Right : Dir.Left);
        tail = move(tail, head.y > tail.y ? Dir.Down : Dir.Up);
      }
      seen.add(tail);
    }
  }

  // console.log(toAscii(seen));
  return seen.size;
}

function part2(moves: Move[]): number {
  const knots = range(0, 10).map(() => ({ x: 0, y: 0 }));
  const seen = new PointSet();
  seen.add(knots[0]);
  for (const { dir, count } of moves) {
    for (let i = 0; i < count; ++i) {
      knots[0] = move(knots[0], dir);
      for (let k = 1; k < knots.length; ++k) {
        const head = knots[k - 1];
        let tail = knots[k];
        // touching; do nothing
        if (Math.abs(head.x - tail.x) < 2 && Math.abs(head.y - tail.y) < 2)
          continue;

        // same col, move horizontally/vert if in same col/row
        if (head.y === tail.y) {
          tail = move(tail, head.x > tail.x ? Dir.Right : Dir.Left);
        } else if (head.x === tail.x) {
          tail = move(tail, head.y > tail.y ? Dir.Down : Dir.Up);
        } else {
          // diagonal
          tail = move(tail, head.x > tail.x ? Dir.Right : Dir.Left);
          tail = move(tail, head.y > tail.y ? Dir.Down : Dir.Up);
        }
        knots[k] = tail;
      }
      seen.add(knots[knots.length - 1]);
    }
  }
  return seen.size;
}

const data = parse(load().lines);
export default solve(
  () => part1(data),
  () => part2(data)
).expect(6271, 2458);
