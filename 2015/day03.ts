import { load, solve } from 'lib/advent';
import { Dir, move, pointHash } from 'lib/coords';
import { concat, iter } from 'lib/iter';

const directions: Record<string, Dir> = {
  '^': Dir.Up,
  '>': Dir.Right,
  v: Dir.Down,
  '<': Dir.Left,
} as const;

const dirs = iter(load().raw.trim().split(''))
  .filter((c) => c in directions)
  .map((c) => directions[c]);

export default solve(
  () => dirs.scan(move, { x: 0, y: 0 }).uniqBy(pointHash).size,
  () =>
    concat(dirs.partition((dir, i) => i % 2 === 0))
      .map((gifter) => gifter.scan(move, { x: 0, y: 0 }))
      .flat()
      .uniqBy(pointHash).size
).expect(2572, 2631);
