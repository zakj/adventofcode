import { load, solve } from 'lib/advent';
import { iter } from 'lib/iter';

const elves = load().paragraphs.map((lines) => iter(lines).map(Number).sum());

export default solve(
  () => iter(elves).max(),
  () =>
    iter(elves.sort((a, b) => b - a))
      .take(3)
      .sum()
).expect(71023, 206289);
