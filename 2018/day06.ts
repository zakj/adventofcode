import { answers, example, load } from '../advent';
import { Counter, sum } from '../util';

type Point = { x: number; y: number };

function parse(lines: string[]): Point[] {
  return lines
    .map((line) => line.split(', ').map(Number))
    .map(([x, y]) => ({ x, y }));
}

function distance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function bounds(coords: Point[]): { min: Point; max: Point } {
  const min = { ...coords[0] };
  const max = { ...coords[0] };
  for (const c of coords) {
    min.x = Math.min(c.x, min.x);
    min.y = Math.min(c.y, min.y);
    max.x = Math.max(c.x, max.x);
    max.y = Math.max(c.y, max.y);
  }
  return { min, max };
}

function largestArea(coords: Point[]): number {
  const { min, max } = bounds(coords);
  const areas = [];
  const infiniteCoords = new Set();
  for (let x = min.x; x <= max.x; ++x) {
    for (let y = min.y; y <= max.y; ++y) {
      const [a, b] = coords
        .map((c, i) => ({ i, distance: distance({ x, y }, c) }))
        .sort((a, b) => a.distance - b.distance);
      if (a.distance != b.distance) {
        areas.push(a.i);
        if (x === min.x || x === max.x || y === min.y || y === max.y)
          infiniteCoords.add(a.i);
      }
    }
  }
  const counter = new Counter(
    [...areas.values()].filter((c) => !infiniteCoords.has(c))
  );
  return counter.mostCommon[0][1];
}

function totalDistanceLessThan(coords: Point[], maxDistance: number): number {
  const { min, max } = bounds(coords);
  let size = 0;
  for (let x = min.x; x <= max.x; ++x) {
    for (let y = min.y; y <= max.y; ++y) {
      const dist = sum(coords.map((c) => distance({ x, y }, c)));
      if (dist < maxDistance) size++;
    }
  }
  return size;
}

const exampleCoords = parse(load(6, 'ex').lines);
example.equal(largestArea(exampleCoords), 17);
example.equal(totalDistanceLessThan(exampleCoords, 32), 16);

const coords = parse(load(6).lines);
answers.expect(4398, 39560);
answers(
  () => largestArea(coords),
  () => totalDistanceLessThan(coords, 10e3)
);
