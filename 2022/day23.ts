import { example, load, solve } from 'lib/advent';
import {
  Dir,
  findBounds,
  move,
  parseGrid,
  Point,
  PointMap,
  PointSet,
} from 'lib/coords';
import { iter } from 'lib/iter';

function parse(lines: string[]) {
  return new PointSet(
    iter(parseGrid(lines, (c) => c === '#'))
      .filter(([, isElf]) => isElf)
      .map(([p]) => p)
      .toArray()
  );
}

function neighbors({ x, y }: Point, elves: PointSet): Record<string, boolean> {
  return {
    N: elves.has({ x, y: y - 1 }),
    E: elves.has({ x: x + 1, y }),
    S: elves.has({ x, y: y + 1 }),
    W: elves.has({ x: x - 1, y }),
    NW: elves.has({ x: x - 1, y: y - 1 }),
    SW: elves.has({ x: x - 1, y: y + 1 }),
    SE: elves.has({ x: x + 1, y: y + 1 }),
    NE: elves.has({ x: x + 1, y: y - 1 }),
  };
}

function part1(elves: PointSet, rounds = 10): number {
  const proposals = [
    { test: (n) => !n.N && !n.NE && !n.NW, dir: Dir.Up },
    { test: (n) => !n.S && !n.SE && !n.SW, dir: Dir.Down },
    { test: (n) => !n.W && !n.NW && !n.SW, dir: Dir.Left },
    { test: (n) => !n.E && !n.NE && !n.SE, dir: Dir.Right },
  ];

  for (let i = 0; i < rounds; ++i) {
    // Propose moves
    const moves = new PointMap<Point>();
    for (const elf of elves) {
      const n = neighbors(elf, elves);
      if (Object.values(n).every((v) => !v)) continue;
      else {
        for (const p of proposals) {
          if (p.test(n)) {
            moves.set(elf, move(elf, p.dir));
            break;
          }
        }
      }
    }

    // Check moves
    const nextElves = new PointSet();
    for (const [cur, next] of moves) {
      const samePoint = iter(moves).filter(
        ([from, to]) => to.x === next.x && to.y === next.y
      );
      if (samePoint.size > 1) {
        samePoint.forEach(([from]) => moves.delete(from));
      }
      // console.log('moving', cur, next);
      // if (
      //   iter(moves).findIndex(
      //     ([from, to]) =>
      //       !(from.x === cur.x && from.y === cur.y) &&
      //       to.x === next.x &&
      //       to.y === next.y
      //   ) !== -1
      // ) {
      //   // console.log('  BAD');
      //   if (nextElves.has(cur)) throw new Error('next elf has cur');
      //   nextElves.add(cur);
      // } else {
      //   // console.log('  good!');
      //   if (nextElves.has(next)) throw new Error('next elf has next');
      //   nextElves.add(next);
      // }
    }

    if (moves.size === 0) {
      // console.log(toAscii(elves));
      return i + 1;
    }

    // Move
    // console.log(toAscii(elves));
    // console.log('--');
    // console.log(toAscii(nextElves));
    // console.log('=======');
    // elves = nextElves;
    for (const [cur, next] of moves) {
      elves.delete(cur);
      elves.add(next);
    }

    // Rotate proposals
    proposals.push(proposals.shift());
  }

  // console.log(toAscii(elves));
  const { min, max } = findBounds(elves);
  // console.log({ min, max }, elves.size);
  // console.log(toAscii(elves));
  return (max.x - min.x + 1) * (max.y - min.y + 1) - elves.size;
}

const exampleData = parse([
  '....#..',
  '..###.#',
  '#...#.#',
  '.#...##',
  '#.###..',
  '##.#.##',
  '.#..#..',
]);
example.equal(110, part1(new PointSet(exampleData), 10));
example.equal(20, part1(exampleData, Infinity));

const data = parse(load().lines);
export default solve(
  () => part1(new PointSet(data)),
  () => part1(data, Infinity),
  () => 0,
  () => 0
).expect(3925, 903);
