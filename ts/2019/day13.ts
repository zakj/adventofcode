import { main } from 'lib/advent';
import { chunks, XMap } from 'lib/util';
import { compile, parse, Program } from './intcode';

enum Tile {
  Empty = 0,
  Wall = 1,
  Block = 2,
  Paddle = 3,
  Ball = 4,
}
type Point = { x: number; y: number };
type Grid = XMap<Point, Tile>;
const h = ({ x, y }: Point) => `${x},${y}`;

const tiles: Record<Tile, string> = {
  [Tile.Empty]: ' ',
  [Tile.Wall]: '#',
  [Tile.Block]: '.',
  [Tile.Paddle]: '-',
  [Tile.Ball]: 'o',
};

function play(program: Program): number {
  const cabinet = compile(program);
  cabinet.memory.set(0, 2);
  const grid = new XMap<Point, Tile>(h);
  let joystick = 0;
  let score = 0;
  let ball: Point;
  let paddle: Point;
  while (!cabinet.halted) {
    for (const [x, y, v] of chunks(cabinet(joystick), 3)) {
      if (x === -1 && y === 0) score = v;
      else {
        grid.set({ x, y }, v);
        if (v === Tile.Ball) ball = { x, y };
        if (v === Tile.Paddle) paddle = { x, y };
      }
    }
    joystick = ball.x < paddle.x ? -1 : ball.x > paddle.x ? 1 : 0;
  }
  return score;
}

// TODO factor out? needs grid, ignore bound check, and char map
function toString(grid: Grid): string {
  const bounds = { x: [Infinity, -Infinity], y: [Infinity, -Infinity] };
  for (const [p, tile] of grid) {
    if (tile === Tile.Empty) continue;
    bounds.x[0] = Math.min(bounds.x[0], p.x);
    bounds.x[1] = Math.max(bounds.x[1], p.x);
    bounds.y[0] = Math.min(bounds.y[0], p.y);
    bounds.y[1] = Math.max(bounds.y[1], p.y);
  }
  const rows = [];
  for (let y = bounds.y[0]; y <= bounds.y[1]; ++y) {
    const row = [];
    for (let x = bounds.x[0]; x <= bounds.x[1]; ++x) {
      row.push(tiles[grid.get({ x, y }) || Tile.Empty]);
    }
    rows.push(row.join(''));
  }
  return rows.join('\n');
}

main(
  (s) =>
    chunks(compile(parse(s))(), 3).filter(([, , t]) => t === Tile.Block).length,
  (s) => play(parse(s))
);
