import { strict as assert } from 'assert';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { performance } from 'perf_hooks';

type Input = {
  lines: string[];
  numbers: number[];
  paragraphs: string[][];
};

function downloadInput(day: number, path: string): void {
  const aoc = require('./.aoc');
  execSync(
    `curl -s -b 'session=${aoc.session}' -o '${path}' https://adventofcode.com/${aoc.year}/day/${day}/input`
  );
}

export function load(day: number, suffix: string = ''): Input {
  const paddedDay = `0${day}`.slice(-2);
  const path = resolve(__dirname, 'input', `${paddedDay}${suffix}.txt`);
  let text: string;
  try {
    text = readFileSync(path).toString().trim();
  } catch (e) {
    if (e.code === 'ENOENT' && !suffix) {
      downloadInput(day, path);
      text = readFileSync(path).toString().trim();
    } else {
      console.error(e.message);
      process.exit(1);
    }
  }
  return {
    lines: text.split('\n'),
    numbers: text.split('\n').map(Number),
    paragraphs: text.split('\n\n').map((p) => p.split('\n')),
  };
}

export function answers(...fns: (() => any)[]): void {
  const colors = {
    green: 32,
    grey: 90,
  };
  const color = (c: keyof typeof colors, text: string) =>
    `\x1b[${colors[c]}m${text}\x1b[0m`;

  fns.forEach((fn, i) => {
    const start = performance.now();
    const result = fn();
    const durationMs = performance.now() - start;
    const duration =
      durationMs > 1000
        ? `${(durationMs / 1000).toFixed(3)}s`
        : `${durationMs.toFixed(3)}m`;
    const width = process.stdout.columns - duration.length - 4;
    console.log(
      `${i + 1}:`,
      color('green', result.toString().padEnd(width)),
      color('grey', duration)
    );
  });
}

const assertHandler: ProxyHandler<typeof assert> = {
  get: function (target, prop, receiver) {
    const obj = Reflect.get(target, prop, receiver);
    if (typeof obj !== 'function') return obj;
    return function (...args: Parameters<typeof obj>) {
      try {
        obj(...args);
      } catch (e) {
        console.error(e.message);
      }
    };
  },
};

export const example: typeof assert = new Proxy(assert, assertHandler);
