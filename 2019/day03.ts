import { defaultDict, loadDay, manhattanDistance, Point } from './util';

enum Direction {
  L = 'L',
  R = "R",
  U = "U",
  D = 'D',
}

interface Move {
  direction: Direction,
  distance: number,
}

type Wire = Move[];

const data = loadDay(3).map(wire =>
  wire.split(',').map((move: string): Move => ({
    direction: move[0] as Direction,
    distance: parseInt(move.slice(1), 10),
  }))
);

const pointToKey = (x: number, y: number) => `${x},${y}`;
const keyToPoint = (s: string): Point => {
  const point = s.split(',').map(x => parseInt(x, 10));
  if (point.length !== 2) throw new Error()
  return [point[0], point[1]];  // TODO better way?
};

const getRange = (start: number, end: number): number[] => {
  const step = start < end ? 1 : -1;
  const arr = [];
  for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
    arr.push(i);
  }
  return arr;
};
const directions: {[key: string]: (x: number, y: number, d: number) => Point} = {
  L: (x, y, d) => [x - d, y],
  R: (x, y, d) => [x + d, y],
  U: (x, y, d) => [x, y + d],
  D: (x, y, d) => [x, y - d],
};
const paths: {[key: string]: (x: number, y: number, d: number) => Point[]} = {
  L: (x, y, d) => getRange(x - 1, x - d).map(x => [x, y]),
  R: (x, y, d) => getRange(x + 1, x + d).map(x => [x, y]),
  U: (x, y, d) => getRange(y + 1, y + d).map(y => [x, y]),
  D: (x, y, d) => getRange(y - 1, y - d).map(y => [x, y]),
};

function closestIntersectionByDistance(wires: Wire[]) {
  const grid = defaultDict(() => new Set());

  wires.forEach((wire, i) => {
    let x = 0;
    let y = 0;
    wire.forEach((move: Move) => {
      const points = paths[move.direction](x, y, move.distance);
      points.forEach(([x, y]) => grid[pointToKey(x, y)].add(i));
      const q = directions[move.direction](x, y, move.distance);
      [x, y] = q; // TODO whyyyyy
    });
  });

  const intersections = Object.entries(grid)
    .filter(([point, wires]) => wires.size > 1)
    .map(([point]) => keyToPoint(point));

  const distances = intersections
    .map((point: Point): [number, Point] => [manhattanDistance([0, 0], point), point])
    .sort((a, b) => a[0] - b[0])
    .slice(1);

  return distances[0];
}

function closestIntersectionBySteps(wires: Wire[]) {
  const grid = defaultDict<number[]>(() => Array(wires.length).fill(0));
  wires.forEach((wire, wireIndex) => {
    let x = 0;
    let y = 0;
    let steps = 0;
    wire.forEach(move => {
      const path = paths[move.direction](x, y, move.distance);
      path.forEach(([x, y]) => {
        steps++;
        const gridSteps = grid[pointToKey(x, y)];
        if (!gridSteps[wireIndex]) gridSteps[wireIndex] = steps;
      })
      const q = directions[move.direction](x, y, move.distance);
      [x, y] = q; // TODO whyyyyy
    });
  });

  const totalSteps = Object.entries(grid)
    .filter(([point, steps]) => point !== '0,0' && steps.every(x => x > 0))
    .map(([point, steps]): [number, Point] => [steps.reduce((acc, x) => acc + x, 0), keyToPoint(point)])
    .sort((a, b) => a[0] - b[0]);

  return totalSteps[0];
}

console.log(closestIntersectionByDistance(data));
console.log(closestIntersectionBySteps(data));
