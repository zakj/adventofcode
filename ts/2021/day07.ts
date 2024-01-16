import { main } from 'lib/advent';
import { allNumbers, sum } from 'lib/util';

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

main(
  (s) => alignCrabs(allNumbers(s), (d) => d),
  (s) => alignCrabs(allNumbers(s), (d) => (d * (1 + d)) / 2)
);
