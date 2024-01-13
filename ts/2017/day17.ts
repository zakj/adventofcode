import { main } from 'lib/advent';
import { rotate } from 'lib/util';

function spinlock(spins: number, steps: number): number[] {
  let buffer = [0];
  for (let i = 1; i < spins; ++i) {
    buffer.push(i);
    buffer = rotate(buffer, steps);
  }
  return buffer;
}

function nthElementAfter(n: number, spins: number, steps: number): number {
  let index = 0;
  let afterN: number;
  for (let i = 1; i < spins; ++i) {
    index = ((index + steps) % i) + 1;
    if (index === 1) afterN = i;
  }
  return afterN;
}

main(
  (s) => spinlock(2018, Number(s))[2018 - Number(s)],
  (s) => nthElementAfter(1, 50e6, Number(s))
);
