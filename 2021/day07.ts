import { load, solve } from 'lib/advent';
import { sum } from 'lib/util';

function alignCrabs(
  crabs: number[],
  distanceCost: (distance: number) => number
): number {
  const maxPos = Math.max(...crabs);
  let bestCost = Infinity;
  for (let i = 0; i <= maxPos; ++i) {
    const cost = sum(crabs.map((c) => distanceCost(Math.abs(i - c))));
    if (cost < bestCost) bestCost = cost;
  }
  return bestCost;
}

const crabs = load().raw.split(',').map(Number);
export default solve(
  () => alignCrabs(crabs, (d) => d),
  () => alignCrabs(crabs, (d) => (d * (1 + d)) / 2)
).expect(357353, 104822130);
