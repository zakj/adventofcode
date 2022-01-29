import { example, load, solve } from 'lib/advent';
import { findBounds, parseSet, Point } from 'lib/coords';
import { Counter, sum } from 'lib/util';

function parse(lines: string[]): Point[] {
  return [...parseSet(lines)];
}

function distance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function largestArea(coords: Point[]): number {
  const { min, max } = findBounds(coords);
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
  const { min, max } = findBounds(coords);
  let size = 0;
  for (let x = min.x; x <= max.x; ++x) {
    for (let y = min.y; y <= max.y; ++y) {
      const dist = sum(coords.map((c) => distance({ x, y }, c)));
      if (dist < maxDistance) size++;
    }
  }
  return size;
}

const exampleCoords = parse(load('ex').lines);
example.equal(largestArea(exampleCoords), 17);
example.equal(totalDistanceLessThan(exampleCoords, 32), 16);

const coords = parse(load().lines);
export default solve(
  () => largestArea(coords),
  () => totalDistanceLessThan(coords, 10e3)
).expect(4398, 39560);
