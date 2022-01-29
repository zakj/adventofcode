import { load, solve } from 'lib/advent';
import { sum } from 'lib/util';

function firstDuplicate(frequencies: number[]): number {
  let cur = 0;
  const seen = new Set([0]);
  while (true) {
    for (let f of frequencies) {
      cur += f;
      if (seen.has(cur)) return cur;
      seen.add(cur);
    }
  }
}

const frequencies = load().numbers;
export default solve(
  () => sum(frequencies),
  () => firstDuplicate(frequencies)
).expect(411, 56360);
