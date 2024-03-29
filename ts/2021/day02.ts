import { main } from 'lib/advent';
import { lines } from 'lib/util';

const DIRECTIONS = ['forward', 'down', 'up'] as const;
type Dir = typeof DIRECTIONS[number];
const isDir = (v: string): v is Dir => DIRECTIONS.includes(v as Dir);

type Course = {
  dir: Dir;
  n: number;
};

function parse(lines: string[]): Course[] {
  return lines.map((line) => {
    const [dir, n] = line.split(' ');
    if (!isDir(dir)) throw 'parse error';
    return {
      dir,
      n: Number(n),
    };
  });
}

main(
  (s) => {
    let h = 0;
    let d = 0;
    for (const step of parse(lines(s))) {
      switch (step.dir) {
        case 'forward':
          h += step.n;
          break;
        case 'down':
          d += step.n;
          break;
        case 'up':
          d -= step.n;
          break;
      }
    }
    return h * d;
  },
  (s) => {
    let aim = 0;
    let h = 0;
    let d = 0;
    for (const step of parse(lines(s))) {
      switch (step.dir) {
        case 'forward':
          h += step.n;
          d += aim * step.n;
          break;
        case 'down':
          aim += step.n;
          break;
        case 'up':
          aim -= step.n;
          break;
      }
    }
    return h * d;
  }
);
