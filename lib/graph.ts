import { DefaultDict } from 'lib/util';
import { MinHeap } from './collections';

/**
 * Dijkstra's algorithm, or A* if heuristic is given.
 */
export default function search<State, Hash extends string | number>(
  start: State,
  goal: State,
  hashState: (state: State) => Hash,
  edgeWeights: (node: State) => [next: State, cost: number][],
  heuristic: (state: State) => number = () => 0
): number {
  const visited = new Set<Hash>();
  const distance = new DefaultDict<Hash, number>(
    () => Infinity,
    [[hashState(start), 0]]
  );
  const q = new MinHeap<State>([[0, start]]);
  const goalHash = hashState(goal);

  while (q.size) {
    const state = q.shift();
    const hash = hashState(state);
    if (hash === goalHash) return distance.get(hash);

    visited.add(hash);
    for (const [next, cost] of edgeWeights(state)) {
      const nextHash = hashState(next);
      if (visited.has(nextHash)) continue;
      const nextCost = distance.get(hash) + cost;
      if (nextCost >= distance.get(nextHash)) continue;
      distance.set(nextHash, nextCost);
      q.add(nextCost + heuristic(next), next);
    }
  }

  throw 'no path';
}
