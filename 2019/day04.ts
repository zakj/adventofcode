import { load, solve } from '../advent';
import { pairs, range } from '../util';

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

const [low, high] = load().lines[0].split('-').map(Number);
export default solve(
  () => range(low, high + 1).filter(isValid1).length,
  () => range(low, high + 1).filter(isValid2).length
).expect(1640, 1126);
