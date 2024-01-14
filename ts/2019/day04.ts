import { main } from 'lib/advent';
import { pairs, range } from 'lib/util';

function isValid1(n: number): boolean {
  const digits = n.toString().split('');
  let hasPair = false;
  for (const [a, b] of pairs(digits)) {
    if (b < a) return false;
    if (a === b) hasPair = true;
  }
  return hasPair;
}

function isValid2(n: number): boolean {
  const digits = n.toString().split('');
  const runs = new Map();
  for (const [a, b] of pairs(digits)) {
    if (b < a) return false;
    if (a === b) runs.set(a, (runs.get(a) || 1) + 1);
  }
  return [...runs.values()].includes(2);
}

function parse(s: string): number[] {
  const [low, high] = s.split('-').map(Number);
  return range(low, high + 1);
}

main(
  (s) => parse(s).filter(isValid1).length,
  (s) => parse(s).filter(isValid2).length
);
