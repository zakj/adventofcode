import { answers, example, load } from '../advent';
import { Point, pointHash } from '../coords';
import { Counter } from '../util';

type Vent = [Point, Point];

function parse(lines: string[]): Vent[] {
  return lines.map((line) => {
    const [start, end] = line.split(' -> ', 2).map((s) => {
      const [x, y] = s.split(',', 2).map(Number);
      return { x, y };
    });
    return [start, end];
  });
}

function ventToPoints(vent: Vent): Point[] {
  let [{ x, y }, end] = vent;
  const dx = x < end.x ? 1 : x > end.x ? -1 : 0;
  const dy = y < end.y ? 1 : y > end.y ? -1 : 0;
  const points = [{ x, y }];
  while (x !== end.x || y !== end.y) {
    x += dx;
    y += dy;
    points.push({ x, y });
  }
  return points;
}

function countOverlaps(vents: Vent[], diagonal = false): number {
  if (!diagonal) {
    vents = vents.filter(([v1, v2]) => v1.x === v2.x || v1.y === v2.y);
  }
  const points = vents.flatMap(ventToPoints);
  return [...new Counter(points.map(pointHash)).entries()].filter(
    ([p, count]) => count >= 2
  ).length;
}

const exampleVents = parse(load(5, 'ex').lines);
example.equal(countOverlaps(exampleVents), 5);
example.equal(countOverlaps(exampleVents, true), 12);

const vents = parse(load(5).lines);
answers.expect(6666, 19081);
answers(
  () => countOverlaps(vents),
  () => countOverlaps(vents, true)
);