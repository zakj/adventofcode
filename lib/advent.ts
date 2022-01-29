import { strict as assert } from 'assert';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { zip } from 'lib/util';
import { dirname, resolve } from 'path';

type Input = {
  raw: string;
  lines: string[];
  numbers: number[];
  paragraphs: string[][];
};

export interface Solver {
  expect: (...values: any[]) => Solver;
  profile: () => Solver;
  shouldProfile: boolean;
  parts: [Function, any][];
}

function downloadInput(year: number, day: number, path: string): void {
  const session = readFileSync(resolve(__dirname, '.session'))
    .toString()
    .trim();
  execSync(
    `curl --silent --show-error --fail --cookie 'session=${session}' -o '${path}' https://adventofcode.com/${year}/day/${day}/input`
  );
}

function findModule(): { dir: string; year: number; day: number } {
  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = (err, stack) => stack;
  // @ts-ignore
  const caller: NodeJS.CallSite = new Error().stack.find(
    (cs: NodeJS.CallSite) => cs.getFileName() !== module.filename
  );
  Error.prepareStackTrace = orig;
  const filename = caller.getFileName();
  const match = /(?<year>\d{4})\/day(?<day>\d\d)(?:-.*)?\.ts$/.exec(filename);
  return {
    dir: dirname(filename),
    year: Number(match.groups.year),
    day: Number(match.groups.day),
  };
}

export function load(suffix: string = ''): Input {
  const module = findModule();
  const paddedDay = `0${module.day}`.slice(-2);
  const path = resolve(module.dir, 'input', `${paddedDay}${suffix}.txt`);
  let text: string;
  try {
    text = readFileSync(path).toString();
  } catch (e) {
    if (e.code === 'ENOENT' && !suffix) {
      try {
        downloadInput(module.year, module.day, path);
        text = readFileSync(path).toString();
      } catch (e) {
        console.error(
          `Failed to fetch ${module.year} day ${module.day}'s input`
        );
        process.exit(1);
      }
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
        .filter(Boolean)
        .map((p) => p.split('\n'));
    },
  };
}

export function solve(...fns: ((prev: any) => any)[]): Solver {
  const expected = [];
  let profile = false;

  return {
    expect(...values: any[]) {
      expected.push(...values);
      return this;
    },

    profile() {
      profile = true;
      return this;
    },

    get shouldProfile() {
      return profile;
    },

    get parts() {
      return fns.map((f, i) => [f, expected[i]] as [Function, any]);
    },
  };
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

export function ocr(s: string, font: string): string {
  const lettersPath = resolve(__dirname, `figlet-${font}.txt`);
  const paras = readFileSync(lettersPath).toString().split('\n\n');
  const values = paras.shift().split('');
  const keys = paras.map((c) => c.split('\n').join(''));
  const charWidth = paras[0].split('\n')[0].length;
  const letterMap = new Map(zip(keys, values) as [string, string][]);
  const rows = s.split('\n');
  let x = 0;
  const output = [];
  while (x < rows[0].length) {
    const key = rows
      .map((r) => r.slice(x, x + charWidth).padEnd(charWidth))
      .join('');
    if (letterMap.has(key)) {
      output.push(letterMap.get(key));
      x += charWidth;
    } else {
      x++; // padding
    }
  }
  return output.join('');
}
