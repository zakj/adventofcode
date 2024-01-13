import { main } from 'lib/advent';
import { allNumbers, sum } from 'lib/util';

function firstDuplicate(frequencies: number[]): number {
  let cur = 0;
  const seen = new Set([0]);
  for (;;) {
    for (const f of frequencies) {
      cur += f;
      if (seen.has(cur)) return cur;
      seen.add(cur);
    }
  }
}

main(
  (s) => sum(allNumbers(s)),
  (s) => firstDuplicate(allNumbers(s))
);
