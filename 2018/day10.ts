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

const rules = parse(load(10).lines);
answers.expect('KFLBHXGK', 10659);
answers(
  () =>
    ocr(toAscii(new PointSet(after(converge(rules), rules))), './figlet.txt'),
  () => converge(rules)
);
