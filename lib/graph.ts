import { DefaultDict, MinHeap, Queue } from 'lib/collections';

type SearchOptionsGoal<T> = { goal: T } | { goalFn: (node: T) => boolean };
type SearchOptionsEdges<T> =
  | { edges: (node: T) => T[] }
  | {
      edgeWeights: (node: T) => [next: T, cost: number][];
      heuristic?: (node: T) => number;
    };
type SearchOptions<T> = { trackPath?: boolean } & SearchOptionsGoal<T> &
  SearchOptionsEdges<T>;

type SearchResults<T, Hash> = {
  state: T;
  distance: Map<Hash, number>;
  previous: Map<Hash, T>;
};

/**
 * With `options.edges`, simple BFS.
 * With `options.edgeWeights`, Dijkstra's algorithm.
 * With `options.edgeWeights` and `options.heuristic`, A*.
 */
function search<State, Hash extends string | number>(
  start: State,
  hashState: (state: State) => Hash,
  options: SearchOptions<State>
): SearchResults<State, Hash> {
  const distance = new DefaultDict<Hash, number>(
    () => Infinity,
    [[hashState(start), 0]]
  );
  const previous = new Map<Hash, State>();

  const isBfs = 'edges' in options;
  const hasGoalFn = 'goalFn' in options;
  const goalHash = hasGoalFn ? null : hashState(options.goal);

  if (isBfs) {
    const q = new Queue<State>([start]);
    while (q.size) {
      const state = q.shift();
      const hash = hashState(state);
      if (hasGoalFn ? options.goalFn(state) : hash === goalHash)
        return { distance, previous, state };

      const currentCost = distance.get(hash);
      for (const next of options.edges(state)) {
        const nextDistance = currentCost + 1;
        const nextHash = hashState(next);
        if (distance.has(nextHash)) continue;
        distance.set(nextHash, nextDistance);
        if (options.trackPath) previous.set(nextHash, state);
        q.add(next);
      }
    }
  } else {
    const q = new MinHeap<State>([[0, start]]);
    while (q.size) {
      const state = q.shift();
      const hash = hashState(state);
      if (hasGoalFn ? options.goalFn(state) : hash === goalHash)
        return { distance, previous, state };

      const currentCost = distance.get(hash);
      for (const [next, cost] of options.edgeWeights(state)) {
        const nextCost = currentCost + cost;
        const nextHash = hashState(next);
        if (nextCost >= distance.get(nextHash)) continue;
        distance.set(nextHash, nextCost);
        if (options.trackPath) previous.set(nextHash, state);
        q.add(nextCost + (options.heuristic?.(next) ?? 0), next);
      }
    }
  }

  throw new Error('no path');
}

export function minDistance<State, Hash extends string | number>(
  start: State,
  hashState: (state: State) => Hash,
  options: SearchOptions<State>
): number {
  const { state, distance } = search(start, hashState, options);
  return distance.get(hashState(state));
}

export function minPath<State, Hash extends string | number>(
  start: State,
  hashState: (state: State) => Hash,
  options: SearchOptions<State>
): State[] {
  const { state, previous } = search(start, hashState, options);
  const path = [];
  let cur = state;
  while (cur) {
    path.push(cur);
    cur = previous.get(hashState(cur));
  }
  return path.reverse();
}
