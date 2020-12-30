import { answers, example, load } from './util';

type Grid = Map<string, boolean>;

function parse(lines: string[]): string[][] {
  const re = /((?:se)|(?:sw)|(?:ne)|(?:nw)|e|w)/g;
  return lines.map((line) => Array.from(line.matchAll(re), (m) => m[0]));
}

function flipTiles(list: string[][]): Grid {
  const grid = new Map();
  list.forEach((instructions) => {
    let x = 0,
      y = 0,
      z = 0;
    instructions.forEach((instr) => {
      switch (instr) {
        case 'ne':
          x++;
          z--;
          break;
        case 'sw':
          x--;
          z++;
          break;
        case 'se':
          y--;
          z++;
          break;
        case 'nw':
          y++;
          z--;
          break;
        case 'e':
          x++;
          y--;
          break;
        case 'w':
          x--;
          y++;
          break;
      }
    });
    const key = [x, y, z].join(',');
    grid.set(key, !grid.get(key));
  });
  return grid;
}

function neighbors(key: string): string[] {
  const [x, y, z] = key.split(',').map(Number);
  return [
    [x + 1, y, z - 1],
    [x - 1, y, z + 1],
    [x, y - 1, z + 1],
    [x, y + 1, z - 1],
    [x + 1, y - 1, z],
    [x - 1, y + 1, z],
  ].map((x) => x.join(','));
}

function cycle(start: Grid): Grid {
  const grid = new Map(start);

  const candidates = new Set<string>();
  for (let [key, value] of grid.entries()) {
    if (!value) continue;
    candidates.add(key);
    for (const n of neighbors(key)) {
      candidates.add(n);
    }
  }

  for (let point of candidates) {
    const isBlack = !!start.get(point);
    const count = neighbors(point)
      .map((p) => start.get(p))
      .filter(Boolean).length;
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

const exampleInput = parse(load(24, 'ex').lines);
const exampleStart = flipTiles(exampleInput);
example.equal(10, countBlack(exampleStart));
example.equal(15, countBlack(life(exampleStart, 1)));
example.equal(2208, countBlack(life(exampleStart, 100)));

const input = parse(load(24).lines);
answers(
  () => countBlack(flipTiles(input)),
  () => countBlack(life(flipTiles(input), 100))
);
