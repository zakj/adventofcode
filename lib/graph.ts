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

type SearchOptions<T> = {
  heuristic?: (state: T) => number;
  goalFn?: (state: T) => boolean;
  trackPath?: boolean;
};

/**
 * Dijkstra's algorithm, or A* if heuristic is given.
 */
// TODO: replace uses of search above
function searchFull<State, Hash extends string | number>(
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
      const nextHash = hashState(next);
      if (distance.has(nextHash)) continue;
      const nextCost = currentCost + cost;
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
  const { state, distance } = searchFull(
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
  const { previous } = searchFull(start, goal, hashState, edgeWeights, options);
  const path = [goal];
  let cur = goal;
  while ((cur = previous.get(hashState(cur)))) path.push(cur);
  return path.reverse();
}
