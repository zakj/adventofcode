import crypto from 'crypto';
import util from 'util';

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

export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) throw new Error('lengths differ');
  return zip(a.split(''), b.split('')).reduce(
    (distance, [x, y]) => distance + (x === y ? 0 : 1),
    0
  );
}

export const last = <T>(xs: T[]): T => xs[xs.length - 1];

export const md5 = (s: string): string =>
  crypto.createHash('md5').update(s).digest('hex');

export function pairs<T>(arr: T[]): T[][] {
  const a = arr.slice(0, -1);
  const b = arr.slice(1);
  return a.map((x, i) => [x, b[i]]);
}

// http://szudzik.com/ElegantPairing.pdf
export function pairingSzudzik(a: number, b: number): number {
  return a >= b ? a * a + a + b : b * b + a;
}

export function pairingSzudzikSigned(a: number, b: number): number {
  a = a >= 0 ? a * 2 : a * -2 - 1;
  b = b >= 0 ? b * 2 : b * -2 - 1;
  return pairingSzudzik(a, b);
}

export function partition<T>(
  predicate: (v: T, i: number) => boolean,
  xs: T[]
): [T[], T[]] {
  const rv: [T[], T[]] = [[], []];
  xs.forEach((x, i) => {
    rv[predicate(x, i) ? 0 : 1].push(x);
  });
  return rv;
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

export function rotate<T>(xs: T[], n = 1): T[] {
  n %= xs.length;
  return [...xs.slice(n), ...xs.slice(0, n)];
}

export function scan<T, U>(
  xs: T[],
  f: (acc: U, value: T) => U,
  initial: U
): U[] {
  let acc = initial;
  return [initial, ...xs.map((x) => (acc = f(acc, x)))];
}

export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x, 0);

export type ValuesOf<T> = T[keyof T];

// TODO refactor old places that could use this
// TODO just enforce KHash = string
export class XMap<K, V, KHash = string> {
  private data = new Map<KHash, V>();
  private _keys = new Map<KHash, K>();

  constructor(
    private hashFn: (k: K) => KHash,
    iterable: Iterable<[K, V]> = []
  ) {
    for (const [p, v] of iterable) {
      this.set(p, v);
    }
  }

  get(key: K): V {
    return this.data.get(this.hashFn(key));
  }

  has(key: K): boolean {
    return this.data.has(this.hashFn(key));
  }

  set(key: K, value: V): XMap<K, V, KHash> {
    const hash = this.hashFn(key);
    this._keys.set(hash, { ...key });
    this.data.set(hash, value);
    return this;
  }

  delete(key: K): boolean {
    const hash = this.hashFn(key);
    this._keys.delete(hash);
    return this.data.delete(hash);
  }

  copy(): XMap<K, V, KHash> {
    const copy = new XMap<K, V, KHash>(this.hashFn);
    copy.data = new Map(this.data);
    copy._keys = new Map(this._keys);
    return copy;
  }

  get size() {
    return this.data.size;
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    for (const [h, v] of this.data) {
      yield [this._keys.get(h), v];
    }
  }

  entries(): [K, V][] {
    return [...this];
  }

  keys(): K[] {
    return [...this._keys.values()];
  }

  values(): V[] {
    return [...this.data.values()];
  }

  [util.inspect.custom](depth: number, options: util.InspectOptionsStylized) {
    const entries = new Map(this.entries());
    return util.inspect(entries, options.showHidden, depth, options.colors);
  }
}

// TODO refactor old places that could use this
export class XSet<T, Hash = string> {
  private map: Map<Hash, T> = new Map();

  constructor(private hashFn: (x: T) => Hash, iterable: Iterable<T> = []) {
    for (const x of iterable) {
      this.add(x);
    }
  }

  add(item: T): void {
    this.map.set(this.hashFn(item), item);
  }

  has(item: T): boolean {
    return this.map.has(this.hashFn(item));
  }

  delete(item: T): boolean {
    return this.map.delete(this.hashFn(item));
  }

  intersect(other: XSet<T, Hash>): XSet<T, Hash> {
    const next = new XSet<T, Hash>(this.hashFn);
    for (const item of this) {
      if (other.has(item)) next.add(item);
    }
    return next;
  }

  get size(): number {
    return this.map.size;
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.map.values();
  }

  [util.inspect.custom](depth: number, options: util.InspectOptionsStylized) {
    const values = new Set(this.map.values());
    return util.inspect(values, options.showHidden, depth, options.colors);
  }
}

export function zip<T>(...arrs: T[][]): T[][] {
  return range(0, arrs[0].length).map((i) => arrs.map((x) => x[i]));
}
