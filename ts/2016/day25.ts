import { main } from 'lib/advent';
import { iter, Iter, range } from 'lib/iter';
import { executeSignals, parse, type ParseResult } from './asembunny';

const signals = (i: number, instructions: ParseResult): Iter<number> =>
  iter(executeSignals(instructions, [['a', i]]));
const is01 = ([a, b]: [number, number]): boolean => a === 0 && b === 1;

main((s) => {
  const instructions = parse(s);
  return range(Infinity).find((i) =>
    signals(i, instructions).take(10).splitEvery(2).every(is01)
  );
});
