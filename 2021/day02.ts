import { load, solve } from '../advent';

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

const course = parse(load().lines);
export default solve(
  () => {
    let h = 0;
    let d = 0;
    for (const step of course) {
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
  () => {
    let aim = 0;
    let h = 0;
    let d = 0;
    for (const step of course) {
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
).expect(2150351, 1842742223);
