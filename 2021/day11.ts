import { answers, load } from '../advent';
import { range, XMap, XSet } from '../util';

type Point = { x: number; y: number };
const h = ({ x, y }: { x: number; y: number }) => `${x},${y}`;

function parse(lines: string[]): XMap<Point, number> {
  const octopuses = new XMap<Point, number>(h);
  for (const y of range(0, lines.length)) {
    for (const x of range(0, lines[0].length)) {
      octopuses.set({ x, y }, Number(lines[y][x]));
    }
  }
  return octopuses;
}

// TODO factor this into utils someday
function neighbors(p: Point): Point[] {
  return [
    { x: p.x, y: p.y - 1 },
    { x: p.x + 1, y: p.y - 1 },
    { x: p.x + 1, y: p.y },
    { x: p.x + 1, y: p.y + 1 },
    { x: p.x, y: p.y + 1 },
    { x: p.x - 1, y: p.y + 1 },
    { x: p.x - 1, y: p.y },
    { x: p.x - 1, y: p.y - 1 },
  ];
}

function stepFlashes(octopuses: XMap<Point, number>): number {
  for (const [point, energy] of octopuses) {
    octopuses.set(point, energy + 1);
  }

  let checkFlashes = true;
  const flashed = new XSet<Point>(h);
  while (checkFlashes) {
    checkFlashes = false;
    for (const [point, energy] of octopuses) {
      if (energy > 9 && !flashed.has(point)) {
        checkFlashes = true;
        flashed.add(point);
        neighbors(point)
          .filter((p) => octopuses.has(p))
          .forEach((n) => octopuses.set(n, octopuses.get(n) + 1));
      }
    }
  }

  [...flashed].forEach((o) => octopuses.set(o, 0));
  return flashed.size;
}

const octopuses = parse(load(11).lines);
answers.expect(1642, 320);
answers(
  () => {
    let flashes = 0;
    for (let i = 0; i < 100; ++i) {
      flashes += stepFlashes(octopuses);
    }
    return flashes;
  },
  () => {
    // XXX mutable octopii :/
    const octopuses = parse(load(11).lines);
    let i = 1;
    while (true) {
      if (stepFlashes(octopuses) === octopuses.size) return i;
      ++i;
    }
  }
);
