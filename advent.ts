import { strict as assert } from 'assert';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, resolve, sep } from 'path';
import { performance } from 'perf_hooks';

type Input = {
  raw: string;
  lines: string[];
  numbers: number[];
  paragraphs: string[][];
};

function downloadInput(year: number, day: number, path: string): void {
  const session = readFileSync(resolve(__dirname, '.session')).toString();
  execSync(
    `curl -s -b 'session=${session}' -o '${path}' https://adventofcode.com/${year}/day/${day}/input`
  );
}

export function load(day: number, suffix: string = ''): Input {
  const yearDir = dirname(require.main.filename);
  const year = Number(yearDir.split(sep).pop());
  const paddedDay = `0${day}`.slice(-2);
  const path = resolve(yearDir, 'input', `${paddedDay}${suffix}.txt`);
  let text: string;
  try {
    text = readFileSync(path).toString();
  } catch (e) {
    if (e.code === 'ENOENT' && !suffix) {
      downloadInput(year, day, path);
      text = readFileSync(path).toString();
    } else {
      console.error(e.message);
      process.exit(1);
    }
  }
  return {
    raw: text,
    get lines() {
      return text.trim().split('\n');
    },
    get numbers() {
      return text.trim().split('\n').map(Number);
    },
    get paragraphs() {
      return text
        .trim()
        .split('\n\n')
        .map((p) => p.split('\n'));
    },
  };
}

export function answers(...fns: (() => any)[]): void {
  const c = (n: number) => (text: string) => `\x1b[${n}m${text}\x1b[0m`;
  const color = {
    red: c(31),
    green: c(32),
    grey: c(90),
  };

  let success = true;
  fns.forEach((fn, i) => {
    const start = performance.now();
    const result = fn();
    const durationMs = performance.now() - start;
    const duration =
      durationMs > 1000
        ? `${(durationMs / 1000).toFixed(3)}s`
        : `${durationMs.toFixed(3)}ms`;
    const indexStr = `${i + 1}: `;
    process.stdout.write(indexStr);
    process.stdout.cursorTo(process.stdout.columns - duration.length);
    process.stdout.write(color.grey(duration));
    process.stdout.cursorTo(indexStr.length);

    const expected = expectedAnswers[i];
    if (typeof expected === 'undefined' || expected === result) {
      console.log(color.green(result?.toString()));
    } else {
      success = false;
      console.log(
        color.red(result?.toString()),
        color.grey('!=='),
        color.green(expected)
      );
    }
  });
  if (!success) process.exit(1);
}

const expectedAnswers: any[] = [];
answers.expect = (...args: any[]) => expectedAnswers.push(...args);

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
