import { readFileSync } from 'fs';
import { answers, load } from '../advent';
import { zip } from '../util';

type Point = number[];
type PointRule = {
  start: Point;
  velocity: Point;
};

function parse(lines: string[]): PointRule[] {
  const re = /[<>]/;
  return lines.map((line) => {
    const chunks = line.split(re);
    const start = chunks[1].trim().split(/,\s+/).map(Number);
    const velocity = chunks[3].trim().split(/,\s+/).map(Number);
    return { start, velocity };
  });
}

function after(seconds: number, rules: PointRule[]): Point[] {
  return rules.map((r) =>
    zip(r.start, r.velocity).map(([p, v]) => p + v * seconds)
  );
}

function bounds(points: Point[]): [Point, Point] {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return [
    [Math.min(...xs), Math.min(...ys)],
    [Math.max(...xs), Math.max(...ys)],
  ];
}

function area(points: Point[]): number {
  const [min, max] = bounds(points);
  return (max[0] - min[0]) * (max[1] - min[1]);
}

function converge(rules: PointRule[]) {
  let last = Infinity;
  for (let i = 0; ; ++i) {
    const cur = area(after(i, rules));
    if (cur > last) return i - 1;
    last = cur;
  }
}

function toString(points: Point[]): string {
  const [min, max] = bounds(points);
  const key = (p: Point): string => `${p[0]},${p[1]}`;
  const ps = new Set(points.map(key));
  const rows = [];
  for (let y = min[1]; y <= max[1]; ++y) {
    const row = [];
    for (let x = min[0]; x <= max[0]; ++x) {
      if (ps.has(key([x, y]))) row.push('#');
      else row.push(' ');
    }
    rows.push(row.join(''));
  }
  return rows.join('\n');
}

function makeLetterMap() {
  // figlet.txt from https://gist.github.com/usbpc/5fa0be48ad7b4b0594b3b8b029bc47b4
  const chunks = readFileSync('./figlet.txt').toString().split('\n\n');
  const values = chunks.shift().split('');
  const keys = chunks.map((c) => c.split('\n').join(''));
  return new Map(zip(keys, values) as [string, string][]);
}

function deFiglet(s: string): string {
  const charWidth = 6;
  const padding = 2;
  const letterMap = makeLetterMap();
  const rows = s.split('\n');
  let x = 0;
  const output = [];
  while (x < rows[0].length) {
    const key = rows.map((r) => r.slice(x, x + charWidth)).join('');
    output.push(letterMap.get(key));
    x += charWidth + padding;
  }
  return output.join('');
}

const rules = parse(load(10).lines);
answers.expect('KFLBHXGK', 10659);
answers(
  () => deFiglet(toString(after(converge(rules), rules))),
  () => converge(rules)
);
