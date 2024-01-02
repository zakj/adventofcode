import { strict as assert } from 'assert';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { zip } from 'lib/util';
import { dirname, resolve } from 'path';
import { performance } from 'perf_hooks';
import WebSocket from 'ws';

type Input = {
  raw: string;
  lines: string[];
  numbers: number[];
  paragraphs: string[][];
};

export type SolverResult = number | bigint | string;
export type SolverFn = (prev: SolverResult) => SolverResult;
export interface Solver {
  expect: (...values: SolverResult[]) => Solver;
  profile: () => Solver;
  shouldProfile: boolean;
  parts: [SolverFn, SolverResult][];
}

function downloadInput(year: number, day: number, path: string): void {
  const session = readFileSync(resolve(__dirname, '..', '.session'))
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

export function load(suffix = ''): Input {
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
        .trimEnd()
        .split('\n\n')
        .filter(Boolean)
        .map((p) => p.split('\n'));
    },
  };
}

export function solve(...fns: SolverFn[]): Solver {
  const expected = [];
  let profile = false;

  return {
    expect(...values: SolverResult[]) {
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
      return fns.map((f, i) => [f, expected[i]] as [SolverFn, SolverResult]);
    },
  };
}

export function main(
  ...fns: ((input: string, args: Record<string, unknown>) => unknown)[]
) {
  // TODO support for multiple inputs
  if (process.argv.length > 2) {
    const ws = new WebSocket(process.argv[2]);
    ws.on('message', (msg) => {
      const { input, args, part } = JSON.parse(msg);
      let i = 1;
      for (const fn of fns) {
        if (part && i !== part) continue;
        const start = performance.now();
        const answer = fn(input, args);
        const duration = (performance.now() - start) / 1000;
        ws.send(JSON.stringify({ type: 'result', answer, duration }));
        i++;
      }
      ws.close();
    });
  } else {
    process.stdin.on('data', (data) => {
      // TODO drop this args support
      const [input, ...extra] = data.toString().split(String.fromCharCode(30));
      const args = JSON.parse(extra[0] ?? '{}');
      for (const fn of fns) console.log(fn(input, args));
    });
  }
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
