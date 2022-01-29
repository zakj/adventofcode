import { example, load, solve } from '../advent';
import { rotate } from '../util';

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

const exampleSteps = 3;
example.equal(spinlock(2018, exampleSteps)[2018 - exampleSteps], 638);
example.equal(nthElementAfter(1, 2018, exampleSteps), 1226);

const steps = load().numbers[0];
export default solve(
  () => spinlock(2018, steps)[2018 - steps],
  () => nthElementAfter(1, 50e6, steps)
).expect(419, 46038988);
