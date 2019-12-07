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
  return Array(Math.abs(end - start) + 1)
    .fill(0)
    .map((x, i) => i + Math.min(start, end));
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
  wires.forEach((wire, i) => {
    let x = 0;
    let y = 0;
    let steps = 0;
    wire.forEach(move => {
      const path = paths[move.direction](x, y, move.distance);
      path.forEach(([x, y]) => {
        steps++;
        const gridSteps = grid[pointToKey(x, y)];
        if (!gridSteps[i]) gridSteps[i] = steps;
      })
      const q = directions[move.direction](x, y, move.distance);
      [x, y] = q; // TODO whyyyyy
    });
  });

  const totalSteps = Object.entries(grid)
    .filter(([point, steps]) => point !== '0,0' && steps.every(x => x > 0))
    .map(([point, steps]) => [steps.reduce((acc, x) => acc + x, 0), keyToPoint(point)])
    // .sort((a, b) => a[0] - b[0])
    .sort((a, b) => {
      console.log(a);
      return -1;
    });

  return totalSteps[0];
}

// const d1: Wire[] = `R75,D30,R83,U83,L12,D49,R71,U7,L72
// U62,R66,U55,R34,D71,R55,D58,R83`.split('\n').map(wire => {
//   return wire.split(',').map(move => ({
//     direction: move[0] as Direction,
//     distance: parseInt(move.slice(1), 10),
//   }))
// });
// const d2: Wire[] = `R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
// U98,R91,D20,R16,D67,R40,U7,R15,U6,R7`.split('\n').map(wire => {
//   return wire.split(',').map(move => ({
//     direction: move[0] as Direction,
//     distance: parseInt(move.slice(1), 10),
//   }))
// });
// console.info(610, closestIntersectionBySteps(d1));
// console.info(410, closestIntersectionBySteps(d2));

console.log(closestIntersectionByDistance(data));
console.log(closestIntersectionBySteps(data));
