import { answers, load, ocr } from '../advent';
import { XMap } from '../util';
import { compile, parse, Program } from './intcode';

enum Color {
  Black = 0,
  White = 1,
}
enum Turn {
  Left = 0,
  Right = 1,
}
enum Dir {
  Up,
  Right,
  Down,
  Left,
}
type Point = { x: number; y: number };
type Grid = XMap<Point, Color>;
const h = ({ x, y }: Point) => `${x},${y}`;
const deltas: Record<Dir, { x: number; y: number }> = {
  [Dir.Up]: { x: 0, y: -1 },
  [Dir.Down]: { x: 0, y: 1 },
  [Dir.Left]: { x: -1, y: 0 },
  [Dir.Right]: { x: 1, y: 0 },
};

function paint(program: Program, startColor: Color): Grid {
  const robot = compile(program);
  const grid = new XMap<Point, Color>(h);
  let dir = Dir.Up;
  let cur = { x: 0, y: 0 };
  grid.set(cur, startColor);

  while (true) {
    const [color, turn] = robot(grid.get(cur) || Color.Black);
    if (robot.halted) break;
    grid.set(cur, color);
    dir = (dir + (turn === Turn.Right ? 1 : 3)) % 4;
    const d = deltas[dir];
    cur = { x: cur.x + d.x, y: cur.y + d.y };
  }
  return grid;
}

function toString(grid: Grid): string {
  let bounds = { x: [Infinity, -Infinity], y: [Infinity, -Infinity] };
  for (const [p, color] of grid) {
    if (color !== Color.White) continue;
    bounds.x[0] = Math.min(bounds.x[0], p.x);
    bounds.x[1] = Math.max(bounds.x[1], p.x);
    bounds.y[0] = Math.min(bounds.y[0], p.y);
    bounds.y[1] = Math.max(bounds.y[1], p.y);
  }
  const rows = [];
  for (let y = bounds.y[0]; y <= bounds.y[1]; ++y) {
    const row = [];
    for (let x = bounds.x[0]; x <= bounds.x[1]; ++x) {
      row.push((grid.get({ x, y }) || Color.Black) === Color.Black ? ' ' : '#');
    }
    rows.push(row.join(''));
  }
  return rows.join('\n');
}

const program = parse(load(11).raw);
answers.expect(2252, 'AGALRGJE');
answers(
  () => paint(program, Color.Black).size,
  () => ocr(toString(paint(program, Color.White)), './figlet.txt')
);
