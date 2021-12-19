import { answers, load, ocr } from '../advent';
import { findBounds, Point, PointSet, toAscii } from '../coords';

type PointRule = {
  start: Point;
  velocity: Point;
};

function parse(lines: string[]): PointRule[] {
  const re = /[<>]/;
  return lines.map((line) => {
    const chunks = line.split(re);
    let [x, y] = chunks[1].trim().split(/,\s+/).map(Number);
    const start = { x, y };
    [x, y] = chunks[3].trim().split(/,\s+/).map(Number);
    const velocity = { x, y };
    return { start, velocity };
  });
}

function after(seconds: number, rules: PointRule[]): Point[] {
  return rules.map((r) => ({
    x: r.start.x + r.velocity.x * seconds,
    y: r.start.y + r.velocity.y * seconds,
  }));
}

function area(points: Point[]): number {
  const { min, max } = findBounds(points);
  return (max.x - min.x) * (max.y - min.y);
}

function converge(rules: PointRule[]): number {
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
