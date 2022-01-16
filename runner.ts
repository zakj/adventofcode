import { existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import inspector from 'inspector';
import { basename, resolve } from 'path';
import * as advent from './advent';
import { Answers } from './advent';

async function runAll() {
  const re = /^\d{4}$/;
  const years = readdirSync(__dirname)
    .filter((dir) => re.test(dir))
    .map((dir) => resolve(__dirname, dir))
    .sort();
  for (const year of years) {
    await runYear(year);
    console.log();
  }
}

async function runYear(dir: string) {
  console.log(`-- ${basename(resolve(dir))} --`);
  const re = /^day\d\d\.ts$/;
  const days = readdirSync(dir)
    .filter((fn) => re.test(fn))
    .map((fn) => resolve(dir, fn))
    .sort();
  for (const day of days) {
    await runDay(day);
  }
}

function timedResult(fn: Function): [unknown, number] {
  const start = performance.now();
  const result = fn();
  const durationMs = performance.now() - start;
  return [result, durationMs];
}

async function runDay(file: string, single = false) {
  const day = await import(resolve(file));
  const solve = day.default;
  if (!single) {
    process.stdout.write(`Day ${file.replace(/.*day(\d\d)\.ts$/, '$1')}`);
  }

  if (!isAnswers(solve)) {
    // TODO: remove this `if` after all files are ported
    if (!single) console.log(color.red(' invalid default export'));
    return;
  }

  for (let i = 0; i < solve.parts.length; ++i) {
    if (single) process.stdout.write(`${i + 1}: `);
    const [fn, expected] = solve.parts[i];
    const [result, duration] = await new Promise((resolve, reject) => {
      if (!solve.shouldProfile) {
        resolve(timedResult(fn));
      } else {
        const session = new inspector.Session();
        session.connect();
        session.post('Profiler.enable', () => {
          session.post('Profiler.start', () => {
            resolve(timedResult(fn));
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
      }
    });

    if (single) printResult(result, expected, duration);
    else printSummary(i, result, expected, duration);
  }
  if (!single) process.stdout.write('\n');
}

const color = (() => {
  const c = (n: number) => (text: string) => `\x1b[${n}m${text}\x1b[0m`;
  return {
    red: c(31),
    yellow: c(33),
    green: c(32),
    grey: c(90),
  };
})();

function humanDuration(d: number): string {
  return d >= 1000
    ? `${(d / 1000).toFixed(2)}s`
    : d >= 1
    ? `${d.toFixed(0)}ms`
    : `${d.toFixed(2)}ms`;
}

function printResult(result: any, expected: any, duration: number): void {
  let output: string;
  if (typeof expected === 'undefined') {
    output = color.yellow(result?.toString());
  } else if (expected === result) {
    output = color.green(result?.toString());
  } else {
    output = [
      color.red(result?.toString()),
      color.grey('!=='),
      color.green(expected),
    ].join(' ');
  }

  const hd = humanDuration(duration);
  process.stdout.write(output);
  process.stdout.cursorTo(process.stdout.columns - hd.length);
  process.stdout.write(color.grey(hd) + '\n');
}

function printSummary(
  i: number,
  result: any,
  expected: any,
  duration: number
): void {
  const pColor =
    typeof expected === 'undefined'
      ? color.yellow
      : result === expected
      ? color.green
      : color.red;
  const dColor =
    duration > 500 ? color.red : duration > 50 ? color.yellow : color.green;
  process.stdout.write(
    `  ${color.grey('•')}  ${pColor(`p${i + 1}`)} ${dColor(
      humanDuration(duration).padStart(6)
    )}`
  );
}

function isAnswers(obj: unknown): obj is Answers {
  return (
    typeof obj === 'object' &&
    'parts' in obj &&
    Array.isArray((obj as any).parts)
  );
}

(function main() {
  const arg = process.argv[2];
  const exists = arg && existsSync(arg);
  const isDir = exists && statSync(arg).isDirectory();
  const isFile = exists && !isDir;

  // TODO: remove this monkeypatch once I've ported all days to the new format.
  if (!isFile) {
    const fakeAnswers = () => {};
    fakeAnswers.expect = () => {};
    // @ts-ignore
    advent.answers = fakeAnswers;
  }

  if (isFile) runDay(arg, true);
  else if (isDir) runYear(arg);
  else if (!arg) runAll();
  else throw `invalid argument ${arg}`;
})();
