import { load, solve } from 'lib/advent';
import { iter } from 'lib/iter';
import { XSet } from 'lib/util';

function parse(lines: string[]) {
  return lines.map((line) => line.split(''));
}

function value(s: string): number {
  if (s.toLowerCase() === s) {
    return s.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
  }
  return s.charCodeAt(0) - 'A'.charCodeAt(0) + 27;
}

const data = parse(load().lines);
export default solve(
  () => {
    let ss = 0;
    for (const line of data) {
      const [a, b] = [
        new XSet((x) => x, line.slice(0, line.length / 2)),
        new XSet((x) => x, line.slice(line.length / 2)),
      ];
      const match = [...a.intersect(b)].pop();
      ss += value(match);
    }
    return ss;
  },
  () => {
    return iter(data)
      .splitEvery(3)
      .map(([a, b, c]) => {
        const xa = new XSet((x) => x, a);
        const xb = new XSet((x) => x, b);
        const xc = new XSet((x) => x, c);
        const match = [...xa.intersect(xb).intersect(xc)].pop();
        return value(match);
      })
      .sum();
  }
).expect();
