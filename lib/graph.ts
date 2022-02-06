import { DefaultDict } from 'lib/util';
import { MinHeap } from './collections';

type SearchOptions<T> = {
  heuristic?: (state: T) => number;
  goalFn?: (state: T) => boolean;
  trackPath?: boolean;
};

/**
 * Dijkstra's algorithm, or A* if heuristic is given.
 */
function search<State, Hash extends string | number>(
  start: State,
  goal: State,
  hashState: (state: State) => Hash,
  edgeWeights: (node: State) => [next: State, cost: number][],
  options: SearchOptions<State> = {}
): { state: State; distance: Map<Hash, number>; previous: Map<Hash, State> } {
  const distance = new DefaultDict<Hash, number>(
    () => Infinity,
    [[hashState(start), 0]]
  );
  const previous = new Map<Hash, State>();
  if (!goal && !options.goalFn) throw 'goal or goalFn required';
  const goalHash = goal ? hashState(goal) : null;

  const q = new MinHeap<State>([[0, start]]);
  while (q.size) {
    const state = q.shift();
    const hash = hashState(state);
    if (options.goalFn?.(state) ?? hash === goalHash)
      return { distance, previous, state };

    const currentCost = distance.get(hash);
    for (const [next, cost] of edgeWeights(state)) {
      const nextCost = currentCost + cost;
      const nextHash = hashState(next);
      if (nextCost >= distance.get(nextHash)) continue;
      distance.set(nextHash, nextCost);
      if (options.trackPath) previous.set(nextHash, state);
      q.add(nextCost + (options.heuristic?.(next) ?? 0), next);
    }
  }

  throw 'no path';
}

export function minDistance<State, Hash extends string | number>(
  start: State,
  goal: State,
  hashState: (state: State) => Hash,
  edgeWeights: (node: State) => [next: State, cost: number][],
  options: SearchOptions<State> = {}
): number {
  const { state, distance } = search(
    start,
    goal,
    hashState,
    edgeWeights,
    options
  );
  return distance.get(hashState(state));
}

export function minPath<State, Hash extends string | number>(
  start: State,
  goal: State,
  hashState: (state: State) => Hash,
  edgeWeights: (node: State) => [next: State, cost: number][],
  options: SearchOptions<State> = {}
): State[] {
  const { previous } = search(start, goal, hashState, edgeWeights, options);
  const path = [goal];
  let cur = goal;
  while ((cur = previous.get(hashState(cur)))) path.push(cur);
  return path.reverse();
}
