import { strict as assert } from 'assert';
import * as fs from 'fs';
import { resolve } from 'path';
import { performance } from 'perf_hooks';

export function answers(...fns: (() => any)[]): void {
  const colors = {
    green: 32,
    grey: 90,
  };
  const color = (c, text) => `\x1b[${colors[c]}m${text}\x1b[89m`;

  fns.forEach((fn, i) => {
    const start = performance.now();
    const result = fn();
    const durationMs = performance.now() - start;
    const duration =
      durationMs > 1000
        ? `${(durationMs / 1000).toFixed(3)}s`
        : `${durationMs.toFixed(3)}m`;
    const width = process.stdout.columns - duration.length - 6;
    console.log(
      `${i + 1}:`,
      color('green', result.toString().padEnd(width)),
      color('grey', `(${duration})`)
    );
  });
}

const assertHandler: ProxyHandler<typeof assert> = {
  get: function (target, prop, receiver) {
    const obj = Reflect.get(target, prop, receiver);
    if (typeof obj !== 'function') return obj;
    return function (...args) {
      try {
        obj(...args);
      } catch (e) {
        console.error(e.message);
      }
    };
  },
};

export const example: typeof assert = new Proxy(assert, assertHandler);

export function loadDay(n: number, prefix: string = 'day'): string {
  const paddedDay = `0${n}`.slice(-2);
  const path = resolve(__dirname, 'input', `${prefix}${paddedDay}.txt`);
  return fs.readFileSync(path).toString().trim();
}

export function loadDayLines(n: number, prefix?: string): string[] {
  return loadDay(n, prefix).split('\n');
}

export type Maybe<T> = T | typeof Nothing;
export const Nothing = Symbol('Nothing');

export const product = (xs: number[]): number => xs.reduce((acc, x) => acc * x);

export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x);
