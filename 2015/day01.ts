import { load, solve } from 'lib/advent';
import { iter } from 'lib/iter';

const floorChanges: Record<string, number> = {
  '(': 1,
  ')': -1,
};

const moveFloor = (floor: number, move: number) => floor + move;

const changes = iter(load().raw.trim().split(''))
  .filter((c) => c in floorChanges)
  .map((c) => floorChanges[c]);

export default solve(
  () => changes.reduce(moveFloor, 0),
  () => changes.scan(moveFloor, 0).findIndex((f) => f < 0)
).expect(280, 1797);
