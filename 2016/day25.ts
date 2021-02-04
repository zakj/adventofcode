import { answers, load } from '../advent';
import { chunks } from '../util';
import { executeSignals, parse } from './asembunny';

function nextN<T>(it: Iterator<T>, n: number): T[] {
  const rv = [];
  for (let i = 0; i < n; ++i) {
    rv.push(it.next().value);
  }
  return rv;
}

const instructions = parse(load(25).lines);
answers.expect(192);
answers(() => {
  const isAlternating = (xs: number[]): boolean =>
    chunks(xs, 2).every(([a, b]) => a === 0 && b === 1);
  for (let i = 0; i < 1000; ++i) {
    const it = executeSignals(instructions, [['a', i]]);
    if (isAlternating(nextN(it, 10))) return i;
  }
});
