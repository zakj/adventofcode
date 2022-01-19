import { load, solve } from '../advent';
import { scan } from '../util';

const floorChanges: Record<string, number> = {
  '(': 1,
  ')': -1,
};

const moveFloor = (floor: number, move: number) => floor + move;

const changes = load()
  .raw.trim()
  .split('')
  .filter((c) => c in floorChanges)
  .map((c) => floorChanges[c]);

export default solve(
  () => changes.reduce(moveFloor, 0),
  () => scan(changes, moveFloor, 0).findIndex((f) => f < 0)
).expect(280, 1797);
