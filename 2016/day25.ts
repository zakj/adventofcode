import { iter, Iter, range } from 'lib/iter';
import { load, solve } from '../advent';
import { executeSignals, parse } from './asembunny';

const signals = (i: number): Iter<number> =>
  iter(executeSignals(instructions, [['a', i]]));
const is01 = ([a, b]: [number, number]): boolean => a === 0 && b === 1;

const instructions = parse(load(25).lines);
export default solve(() =>
  range(Infinity).find((i) => signals(i).take(10).splitEvery(2).every(is01))
).expect(192);
