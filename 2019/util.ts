import fs from 'fs';
import { resolve } from 'path';

export function* combinations<T>(arr: T[]): Generator<[T, T]> {
  for (let i = 0; i < arr.length; ++i) {
    for (let j = i + 1; j < arr.length; ++j) {
      yield [arr[i], arr[j]];
    }
  }
}

export function defaultDict<T>(initial: () => T) {
  return new Proxy<{[key: string]: T}>(
    {},
    {
      get(target, p: string) {
        if (!(p in target)) target[p] = initial();
        return target[p];
      },
    }
  );
}

export function gcd(a: number, b: number): number {
  return !b ? a : gcd(b, a % b);
}

export function loadDay(n: number): string[] {
  const paddedDay = ('0' + n).slice(-2);
  const path = resolve(__dirname, 'input', `day${paddedDay}.txt`);
  return fs
    .readFileSync(path)
    .toString()
    .trim()
    .split('\n');
}

export function loadIntcode(n: number): number[] {
  return loadDay(n)
    .join('\n')
    .split(',')
    .map(Number);
}

export type Point = [number, number]; 

export function manhattanDistance([x0, y0]: Point, [x1, y1]: Point): number {
  return Math.abs(x1 - x0) + Math.abs(y1 - y0);
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

export function roundRobin<T>(outer: T[][]): T[] {
  const rv: T[][] = [];
  outer.forEach(arr => arr.forEach((x, i) => {
    rv[i] = rv[i] || []
    rv[i].push(x);
  }))
  return ([] as T[]).concat(...rv);
}
