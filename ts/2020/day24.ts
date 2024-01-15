import { main } from 'lib/advent';
import { lines, sum, zip } from 'lib/util';

type Grid = Map<string, boolean>;

type Direction = 'ne' | 'e' | 'se' | 'sw' | 'w' | 'nw';
type Point = [x: number, y: number, z: number];

const neighborDeltas = new Map<Direction, Point>([
  ['ne', [1, 0, -1]],
  ['e', [1, -1, 0]],
  ['se', [0, -1, 1]],
  ['sw', [-1, 0, 1]],
  ['w', [-1, 1, 0]],
  ['nw', [0, 1, -1]],
]);

function parse(lines: string[]): Direction[][] {
  const re = /((?:se)|(?:sw)|(?:ne)|(?:nw)|e|w)/g;
  return lines.map((line) =>
    Array.from(line.matchAll(re), (m) => m[0] as Direction)
  );
}

function flipTiles(list: Direction[][]): Grid {
  const grid = new Map();
  list.forEach((directions) => {
    let point = [0, 0, 0];
    directions.forEach((dir) => {
      point = zip(point, neighborDeltas.get(dir)).map(sum);
    });
    const key = point.join(',');
    grid.set(key, !grid.get(key));
  });
  return grid;
}

const neighborsCache = new Map<string, string[]>();
function neighbors(key: string): string[] {
  if (!neighborsCache.has(key)) {
    const point = key.split(',').map(Number) as Point;
    neighborsCache.set(
      key,
      [...neighborDeltas.values()].map((delta) =>
        zip(point, delta).map(sum).join(',')
      )
    );
  }
  return neighborsCache.get(key);
}

function cycle(start: Grid): Grid {
  const grid = new Map(start);

  const candidates = new Set<string>();
  for (const [key, value] of grid.entries()) {
    if (!value) continue;
    candidates.add(key);
    for (const n of neighbors(key)) {
      candidates.add(n);
    }
  }

  for (const point of candidates) {
    const isBlack = !!start.get(point);
    const count = neighbors(point).filter((p) => start.get(p)).length;
    grid.set(point, count === 2 || (count === 1 && isBlack));
  }

  return grid;
}

function life(grid: Grid, days: number): Grid {
  for (let i = 0; i < days; ++i) {
    grid = cycle(grid);
  }
  return grid;
}

const countBlack = (grid: Grid) => [...grid.values()].filter(Boolean).length;

main(
  (s) => countBlack(flipTiles(parse(lines(s)))),
  (s) => countBlack(life(flipTiles(parse(lines(s))), 100))
);
