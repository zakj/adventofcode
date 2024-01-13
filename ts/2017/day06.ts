import { main } from 'lib/advent';
import { allNumbers } from 'lib/util';

function cycle(banks: number[]): number[] {
  banks = [...banks];
  let transfer = Math.max(...banks.filter((x) => x > 0));
  let i = banks.findIndex((x) => x === transfer);
  banks[i] = 0;
  while (transfer) {
    i = (i + 1) % banks.length;
    banks[i] += 1;
    transfer--;
  }
  return banks;
}

function cyclesToDuplicate(banks: number[]): number {
  const seen = new Set<string>([banks.join(',')]);
  for (let i = 1; ; ++i) {
    banks = cycle(banks);
    const h = banks.join(',');
    if (seen.has(h)) return i;
    seen.add(h);
  }
}

function loopCycles(banks: number[]): number {
  const seen = new Map<string, number>([[banks.join(','), 0]]);
  for (let i = 1; ; ++i) {
    banks = cycle(banks);
    const h = banks.join(',');
    if (seen.has(h)) return i - seen.get(h);
    seen.set(h, i);
  }
}

main(
  (s) => cyclesToDuplicate(allNumbers(s)),
  (s) => loopCycles(allNumbers(s))
);
