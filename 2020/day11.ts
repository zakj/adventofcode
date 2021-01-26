import { answers, example, load } from '../advent';

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

function runSeatingRoundPart1(grid: Grid): Grid {
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

function runSeatingRoundPart2(grid: Grid): Grid {
  const next: Grid = {
    width: grid.width,
    height: grid.height,
    layout: [...grid.layout],
  };
  grid.layout.forEach((type, i) => {
    const occupiedVisibleSeats = countVisibleSeats(grid, i);
    if (type === PositionType.EmptySeat && occupiedVisibleSeats === 0) {
      next.layout[i] = PositionType.OccupiedSeat;
    }
    if (type === PositionType.OccupiedSeat && occupiedVisibleSeats >= 5) {
      next.layout[i] = PositionType.EmptySeat;
    }
  });
  return next;
}

function* line(
  grid: Grid,
  from: Point,
  direction: { x: number; y: number }
): Generator<PositionType> {
  const current = { x: from.x, y: from.y };
  while (true) {
    current.x += direction.x;
    current.y += direction.y;
    if (isWithinBounds(grid, current))
      yield grid.layout[pointToIndex(grid, current)];
    else break;
  }
}

function countVisibleSeats(grid: Grid, i: number): number {
  const from = indexToPoint(grid, i);
  const directions = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
  ];
  return directions.reduce((seats, dir) => {
    for (const type of line(grid, from, dir)) {
      if (type === PositionType.EmptySeat) {
        break;
      }
      if (type === PositionType.OccupiedSeat) {
        seats++;
        break;
      }
    }
    return seats;
  }, 0);
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

function stabilize(grid: Grid, round: (grid: Grid) => Grid): Grid {
  let prev: Grid;
  do {
    prev = grid;
    grid = round(grid);
  } while (JSON.stringify(prev.layout) !== JSON.stringify(grid.layout));
  return grid;
}

const exampleGrid = parseGrid(load(11, 'ex').lines);
example.equal(
  37,
  stabilize(exampleGrid, runSeatingRoundPart1).layout.filter(
    (t) => t === PositionType.OccupiedSeat
  ).length
);
example.equal(
  26,
  stabilize(exampleGrid, runSeatingRoundPart2).layout.filter(
    (t) => t === PositionType.OccupiedSeat
  ).length
);

const grid = parseGrid(load(11).lines);
answers(
  () =>
    stabilize(grid, runSeatingRoundPart1).layout.filter(
      (t) => t === PositionType.OccupiedSeat
    ).length,
  () =>
    stabilize(grid, runSeatingRoundPart2).layout.filter(
      (t) => t === PositionType.OccupiedSeat
    ).length
);
