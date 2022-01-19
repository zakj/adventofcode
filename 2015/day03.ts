import { load, solve } from '../advent';
import { Dir, move, PointSet } from '../coords';
import { partition, scan } from '../util';

const directions: Record<string, Dir> = {
  '^': Dir.Up,
  '>': Dir.Right,
  v: Dir.Down,
  '<': Dir.Left,
} as const;

const dirs = load()
  .raw.trim()
  .split('')
  .filter((c) => c in directions)
  .map((c) => directions[c]);

export default solve(
  () => new PointSet(scan(dirs, move, { x: 0, y: 0 })).size,
  () =>
    new PointSet(
      partition((_, i) => i % 2 === 0, dirs).flatMap((ds) =>
        scan(ds, move, { x: 0, y: 0 })
      )
    ).size
).expect(2572, 2631);
