export function* combinations<T>(arr: T[]): Generator<[T, T]> {
  for (let i = 0; i < arr.length; ++i) {
    for (let j = i + 1; j < arr.length; ++j) {
      yield [arr[i], arr[j]];
    }
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

export const product = (xs: number[]): number => xs.reduce((acc, x) => acc * x);

export function range(start: number, stop: number): number[] {
  const xs = [];
  for (let i = start; i < stop; ++i) xs.push(i);
  return xs;
}

export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x);
