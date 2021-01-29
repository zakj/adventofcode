import crypto from 'crypto';

export function cartesianProduct<T>(...arrays: T[][]): T[][] {
  return arrays.reduce(
    (acc, arr) => acc.flatMap((xs) => arr.map((x) => [...xs, x])),
    [[]]
  );
}

export function chunks<T>(arr: T[], chunkSize: number): T[][] {
  const output = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    output.push(arr.slice(i, i + chunkSize));
  }
  return output;
}

export function* combinations<T>(arr: T[]): Generator<[T, T]> {
  for (let i = 0; i < arr.length; ++i) {
    for (let j = i + 1; j < arr.length; ++j) {
      yield [arr[i], arr[j]];
    }
  }
}

export class Counter<T> {
  private counts: Map<T, number>;

  constructor(xs: T[]) {
    this.counts = xs.reduce((counts, x) => {
      if (!counts.has(x)) counts.set(x, 0);
      counts.set(x, counts.get(x) + 1);
      return counts;
    }, new Map<T, number>());
  }

  get length() {
    return this.counts.size;
  }

  entries() {
    return this.counts.entries();
  }

  get mostCommon(): [T, number][] {
    return [...this.entries()].sort(([_a, a], [_b, b]) => b - a);
  }
}

export class DefaultDict<K, V> extends Map<K, V> {
  constructor(private init: () => V) {
    super();
  }
  get(key: K): V {
    if (!super.has(key)) super.set(key, this.init());
    return super.get(key);
  }
}

export const md5 = (s: string): string =>
  crypto.createHash('md5').update(s).digest('hex');

export function pairs<T>(arr: T[]): T[][] {
  const a = arr.slice(0, -1);
  const b = arr.slice(1);
  return a.map((x, i) => [x, b[i]]);
}

export function* permutations<T>(arr: T[]): Generator<T[]> {
  const length = arr.length;
  const c = Array(length).fill(0);
  let i = 1;

  yield arr.slice();
  while (i < length) {
    if (c[i] < i) {
      const k = i % 2 && c[i];
      const p = arr[i];
      arr[i] = arr[k];
      arr[k] = p;
      ++c[i];
      i = 1;
      yield arr.slice();
    } else {
      c[i] = 0;
      ++i;
    }
  }
}

export class PriorityQueue<T> {
  private items: [T, number][];

  constructor(private cost: (x: T) => number, xs: T[] = []) {
    this.items = [];
    for (let x of xs) this.add(x);
  }

  get length(): number {
    return this.items.length;
  }

  add(item: T): void {
    const cost = this.cost(item);
    const insertAt = this.items.findIndex(([_, c]) => c >= cost);
    if (insertAt === -1) this.items.push([item, cost]);
    else this.items.splice(insertAt, 0, [item, cost]);
  }

  shift(): T {
    if (this.items.length === 0) return undefined;
    const top = this.items.shift();
    return top[0];
  }
}

export const product = (xs: number[]): number => xs.reduce((acc, x) => acc * x);

export function range(start: number, stop: number): number[] {
  const step = start < stop ? 1 : -1;
  let length = Math.abs(start - stop);
  const xs = [];
  while (length--) {
    xs.push(start);
    start += step;
  }
  return xs;
}

export function rotate<T>(xs: T[], n: number = 1): T[] {
  n %= xs.length;
  return [].concat(xs.slice(n), xs.slice(0, n));
}

export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x, 0);

export function zip<T>(...arrs: T[][]): T[][] {
  return range(0, arrs[0].length).map((i) => arrs.map((x) => x[i]));
}
