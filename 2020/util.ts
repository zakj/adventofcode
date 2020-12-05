import { strict as assert } from 'assert';
import * as fs from 'fs';
import { resolve } from 'path';

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

export function loadDay(n: number): string[] {
  const paddedDay = `0${n}`.slice(-2);
  const path = resolve(__dirname, 'input', `day${paddedDay}.txt`);
  return fs.readFileSync(path).toString().trim().split('\n');
}

export const product = (xs: number[]): number => xs.reduce((acc, x) => acc * x);

export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x);
