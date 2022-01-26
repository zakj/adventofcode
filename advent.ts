import { strict as assert } from 'assert';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import inspector from 'inspector';
import { dirname, resolve } from 'path';
import { performance } from 'perf_hooks';
import { zip } from './util';

type Input = {
  raw: string;
  lines: string[];
  numbers: number[];
  paragraphs: string[][];
};

export interface Answers {
  expect: (...values: any[]) => Answers;
  profile: () => Answers;
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
  const match = /(?<year>\d{4})\/day(?<day>\d\d)\.ts$/.exec(filename);
  return {
    dir: dirname(filename),
    year: Number(match.groups.year),
    day: Number(match.groups.day),
  };
}

// TODO: day is unused now
export function load(day: number, suffix?: string): Input;
export function load(suffix?: string): Input;
export function load(day?: number | string, suffix: string = ''): Input {
  if (typeof day === 'string') suffix = day; // XXX remove after removing first arg
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

export function solve(...fns: ((prev: any) => any)[]): Answers {
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

// TODO remove after porting all existing days
export async function answers(...fns: (() => any)[]): Promise<void> {
  const c = (n: number) => (text: string) => `\x1b[${n}m${text}\x1b[0m`;
  const color = {
    red: c(31),
    yellow: c(33),
    green: c(32),
    grey: c(90),
  };

  let success = true;
  for (let i = 0; i < fns.length; ++i) {
    const fn = fns[i];
    const indexStr = `${i + 1}: `;
    process.stdout.write(indexStr);

    await new Promise((resolve, reject) => {
      if (answers.profile) {
        const session = new inspector.Session();
        session.connect();
        session.post('Profiler.enable', () => {
          session.post('Profiler.start', () => {
            const start = performance.now();
            try {
              const result = fn();
              const durationMs = performance.now() - start;
              resolve([result, durationMs]);
            } catch (e) {
              reject(e);
            }
            session.post('Profiler.stop', (err, { profile }) => {
              if (err) return;
              writeFileSync(
                `./part${i + 1}.cpuprofile`,
                JSON.stringify(profile)
              );
            });
          });
        });
        session.disconnect();
      } else {
        const start = performance.now();
        const result = fn();
        const durationMs = performance.now() - start;
        resolve([result, durationMs]);
      }
    })
      .then(([result, durationMs]) => {
        const duration =
          durationMs > 1000
            ? `${(durationMs / 1000).toFixed(3)}s`
            : `${durationMs.toFixed(3)}ms`;
        if (process.stdout.cursorTo) {
          process.stdout.cursorTo(process.stdout.columns - duration.length);
          process.stdout.write(color.grey(duration));
          process.stdout.cursorTo(indexStr.length);
        }

        const expected = expectedAnswers[i];
        if (expected === result) {
          console.log(color.green(result?.toString()));
        } else if (typeof expected === 'undefined') {
          success = false;
          console.log(color.yellow(result?.toString()));
        } else {
          success = false;
          console.log(
            color.red(result?.toString()),
            color.grey('!=='),
            color.green(expected)
          );
        }
      })
      .catch((e) => {
        console.error(color.red(e));
      });
  }

  if (!success) process.exit(1);
}

const expectedAnswers: any[] = [];
answers.expect = (...args: any[]) => expectedAnswers.push(...args);
answers.profile = false;

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
