import { example, loadDayLines } from './util';

enum PositionType {
  Floor = '.',
  EmptySeat = 'L',
  OccupiedSeat = '#',
}

type Point = {
  x: number;
  y: number;
};

type Grid = {
  width: number;
  height: number;
  layout: PositionType[];
};

function parseGrid(lines: string[]): Grid {
  const charToType = {
    ['.']: PositionType.Floor,
    ['L']: PositionType.EmptySeat,
    ['#']: PositionType.OccupiedSeat,
  };
  return {
    width: lines[0].length,
    height: lines.length,
    layout: [...lines.join('')].map((c) => charToType[c]),
  };
}

function runSeatingRound(grid: Grid): Grid {
  const next: Grid = {
    width: grid.width,
    height: grid.height,
    layout: [...grid.layout],
  };
  grid.layout.forEach((type, i) => {
    const occupiedNeighbors = neighbors(grid, i).filter(
      (t) => t === PositionType.OccupiedSeat
    ).length;
    if (type === PositionType.EmptySeat && occupiedNeighbors === 0) {
      next.layout[i] = PositionType.OccupiedSeat;
    }
    if (type === PositionType.OccupiedSeat && occupiedNeighbors >= 4) {
      next.layout[i] = PositionType.EmptySeat;
    }
  });
  return next;
}

function neighbors(grid: Grid, i: number): PositionType[] {
  const { x, y } = indexToPoint(grid, i);
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x: x, y: y - 1 },
    { x: x - 1, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x, y: y + 1 },
    { x: x - 1, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ]
    .filter((p) => isWithinBounds(grid, p))
    .map((p) => grid.layout[pointToIndex(grid, p)]);
}

function indexToPoint(grid: Grid, i: number): Point {
  return {
    x: i % grid.width,
    y: Math.floor(i / grid.width),
  };
}

function pointToIndex(grid: Grid, point: Point): number {
  return point.y * grid.width + point.x;
}

function isWithinBounds(grid: Grid, point: Point): boolean {
  return (
    point.x >= 0 &&
    point.x < grid.width &&
    point.y >= 0 &&
    point.y < grid.height
  );
}

function stabilize(grid: Grid): Grid {
  let prev: Grid;
  do {
    prev = grid;
    grid = runSeatingRound(grid);
  } while (JSON.stringify(prev.layout) !== JSON.stringify(grid.layout));
  return grid;
}

const exampleGrid = parseGrid(loadDayLines(11, 'example'));
example.equal(
  37,
  stabilize(exampleGrid).layout.filter((t) => t === PositionType.OccupiedSeat)
    .length
);

const grid = parseGrid(loadDayLines(11));
console.log({
  1: stabilize(grid).layout.filter((t) => t === PositionType.OccupiedSeat)
    .length,
});
