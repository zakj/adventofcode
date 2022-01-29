import { DefaultDict } from 'lib/util';

class PriorityQueue<T> {
  private heap: { value: T; cost: number }[] = [];

  constructor(xs: [value: T, cost: number][] = []) {
    for (const x of xs) this.add(...x);
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }
  private left(i: number): number {
    return 2 * i + 1;
  }
  private right(i: number): number {
    return 2 * i + 2;
  }
  private swap(a: number, b: number): void {
    [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]];
  }

  public add(value: T, cost: number): void {
    this.heap.push({ value, cost });
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = this.parent(i);
      if (this.heap[p].cost < this.heap[i].cost) break;
      this.swap(i, p);
      i = p;
    }
  }

  public shift(): T {
    if (this.heap.length === 0) return undefined;
    this.swap(0, this.heap.length - 1);
    const value = this.heap.pop().value;

    let cur = 0;
    while (this.left(cur) < this.heap.length) {
      let smallerChild = this.left(cur);
      const right = this.right(cur);
      if (
        right < this.heap.length &&
        this.heap[right].cost < this.heap[smallerChild].cost
      ) {
        smallerChild = right;
      }
      if (this.heap[smallerChild].cost > this.heap[cur].cost) break;
      this.swap(cur, smallerChild);
      cur = smallerChild;
    }

    return value;
  }

  public get size(): number {
    return this.heap.length;
  }
}

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
  const q = new PriorityQueue<State>([[start, 0]]);
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
      q.add(next, nextCost + heuristic(next));
    }
  }

  throw 'no path';
}
