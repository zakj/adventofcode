import { answers, load } from '../advent';
import { sum } from '../util';

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

const frequencies = load(1).numbers;
answers.expect(411, 56360);
answers(
  () => sum(frequencies),
  () => firstDuplicate(frequencies)
);
