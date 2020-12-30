export * from './advent';

export type Maybe<T> = T | typeof Nothing;
export const Nothing = Symbol('Nothing');

export const product = (xs: number[]): number => xs.reduce((acc, x) => acc * x);

export function range(start: number, stop: number): number[] {
  const xs = [];
  for (let i = start; i < stop; ++i) xs.push(i);
  return xs;
}

export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x);
