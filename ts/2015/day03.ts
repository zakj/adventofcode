import { main } from 'lib/advent';
import { Dir, move, pointHash } from 'lib/coords';
import { Iter, concat, iter } from 'lib/iter';

const directions: Record<string, Dir> = {
  '^': Dir.Up,
  '>': Dir.Right,
  v: Dir.Down,
  '<': Dir.Left,
} as const;

function parse(s: string): Iter<Dir> {
  return iter(s.trim().split(''))
    .filter((c) => c in directions)
    .map((c) => directions[c]);
}

main(
  (s) => parse(s).scan(move, { x: 0, y: 0 }).uniqBy(pointHash).size,
  (s) =>
    concat(parse(s).partition((dir, i) => i % 2 === 0))
      .map((gifter) => gifter.scan(move, { x: 0, y: 0 }))
      .flat()
      .uniqBy(pointHash).size
);
