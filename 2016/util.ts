import crypto from 'crypto';

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

export const product = (xs: number[]): number => xs.reduce((acc, x) => acc * x);
export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x, 0);

export function range(start: number, stop: number): number[] {
  const step = start < stop ? 1 : -1
  let length = Math.abs(start - stop);
  const xs = [];
  while (length--) {
    xs.push(start);
    start += step;
  }
  return xs;
}

export function zip<T>(...arrs: T[][]): T[][] {
  return range(0, arrs[0].length).map((i) => arrs.map((x) => x[i]));
}
