import { answers, load } from '../advent';
import { sum } from '../util';

function alignCrabs(crabs: number[]): number {
  const maxPos = Math.max(...crabs);
  let bestPos = null;
  let bestCost = Infinity;
  for (let i = 0; i <= maxPos; ++i) {
    const cost = sum(crabs.map((c) => Math.abs(i - c)));
    if (cost < bestCost) {
      bestCost = cost;
      bestPos = i;
    }
  }
  return bestCost;
}

function alignCrabs2(crabs: number[]): number {
  const maxPos = Math.max(...crabs);
  let bestPos = null;
  let bestCost = Infinity;
  for (let i = 0; i <= maxPos; ++i) {
    const cost = sum(crabs.map((c) => sumOfConsInts(Math.abs(i - c))));
    if (cost < bestCost) {
      bestCost = cost;
      bestPos = i;
    }
  }
  return bestCost;
}

function sumOfConsInts(x: number): number {
  return (x * (1 + x)) / 2;
}

const crabs = load(7).raw.split(',').map(Number);
answers.expect(357353);
answers(
  () => alignCrabs(crabs),
  () => alignCrabs2(crabs)
);
