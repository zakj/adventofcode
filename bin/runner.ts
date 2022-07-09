import { existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import inspector from 'inspector';
import { Solver, SolverFn, SolverResult } from 'lib/advent';
import { color, makeTable } from 'lib/format';
import { basename, join, resolve } from 'path';
import { performance } from 'perf_hooks';

type Result = {
  part: number;
  result: SolverResult;
  expected: SolverResult;
  duration: number;
};

async function runAll() {
  const re = /^\d{4}$/;
  const rootDir = join(__dirname, '..');
  const years = readdirSync(rootDir)
    .filter((dir) => re.test(dir))
    .map((dir) => resolve(rootDir, dir))
    .sort();
  for (const year of years) {
    await runYear(year);
    console.log();
  }
}

async function runYear(dir: string) {
  const re = /^day\d\d\.ts$/;
  const days = readdirSync(dir)
    .filter((fn) => re.test(fn))
    .map((fn) => resolve(dir, fn))
    .sort();
  const table = makeTable([6, 8, 8], process.stdout);
  table.header(basename(resolve(dir)));
  for (const day of days) {
    table.startRow();
    table.cell(`Day ${day.replace(/.*day(\d\d)\.ts$/, '$1')}`);
    await runDay(day, table.cell);
    table.endRow();
  }
  table.footer();
}

function isSolver(obj: unknown): obj is Solver {
  return (
    typeof obj === 'object' &&
    'parts' in obj &&
    Array.isArray((obj as any).parts)
  );
}

function timedResult(fn: SolverFn, prev: SolverResult): [unknown, number] {
  const start = performance.now();
  const result = fn(prev);
  const durationMs = performance.now() - start;
  return [result, durationMs];
}

async function runDay(file: string, printer?: (s: string) => void) {
  const day = await import(resolve(file));
  const solve = day.default;

  if (!isSolver(solve)) {
    // TODO: rework this `if` after all files are ported
    if (printer) printer(color.red('invalid export'));
    return;
  }

  let previousResult = undefined;
  for (let i = 0; i < solve.parts.length; ++i) {
    const [fn, expected] = solve.parts[i];
    const [result, duration] = await new Promise((resolve) => {
      if (!solve.shouldProfile) {
        resolve(timedResult(fn, previousResult));
      } else {
        const session = new inspector.Session();
        session.connect();
        session.post('Profiler.enable', () => {
          session.post('Profiler.start', () => {
            resolve(timedResult(fn, previousResult));
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
    previousResult = result;

    if (printer) printer(fmtSummary({ part: i, result, expected, duration }));
    else printResult({ part: i, result, expected, duration });
  }
}

function humanDuration(d: number): string {
  return d >= 1000
    ? `${(d / 1000).toFixed(2)}s`
    : d >= 1
    ? `${d.toFixed(0)}ms`
    : `${d.toFixed(2)}ms`;
}

function printResult({ part, result, expected, duration }: Result): void {
  process.stdout.write(`${part + 1}: `);
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

function fmtSummary({ result, expected, duration }: Result): string {
  const dColor =
    duration > 500 ? color.red : duration > 50 ? color.yellow : color.grey;
  const success =
    typeof expected === 'undefined'
      ? color.yellow('?')
      : result === expected
      ? color.green('✓')
      : color.red('×');
  return `${dColor(humanDuration(duration).padStart(6))} ${success}`;
}

(async function main() {
  // TODO better input handling
  // - https://github.com/tj/commander.js
  // - add fast option for `ts-node -T`, quiet option?
  const arg = process.argv[2];
  const exists = arg && existsSync(arg);
  const isDir = exists && statSync(arg).isDirectory();
  const isFile = exists && !isDir;

  try {
    if (isFile) await runDay(arg);
    else if (isDir) runYear(arg);
    else if (!arg) runAll();
    else throw `invalid argument ${arg}`;
  } catch (e) {
    console.error(e.stack);
  }
})();
