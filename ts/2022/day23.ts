import { main } from 'lib/advent';
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
import { lines } from 'lib/util';

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
    for (const next of moves.values()) {
      const samePoint = iter(moves).filter(
        ([, to]) => to.x === next.x && to.y === next.y
      );
      if (samePoint.size > 1) {
        samePoint.forEach(([from]) => moves.delete(from));
      }
    }

    if (moves.size === 0) return i + 1;

    // Move
    for (const [cur, next] of moves) {
      elves.delete(cur);
      elves.add(next);
    }

    // Rotate proposals
    proposals.push(proposals.shift());
  }

  const { min, max } = findBounds(elves);
  return (max.x - min.x + 1) * (max.y - min.y + 1) - elves.size;
}

// TODO: cleanup
// TODO: optimize p2: 48s
main(
  (s) => part1(new PointSet(parse(lines(s)))),
  (s) => part1(parse(lines(s)), Infinity)
);
