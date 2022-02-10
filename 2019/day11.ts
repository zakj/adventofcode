import { load, ocr, solve } from 'lib/advent';
import {
  Dir,
  move,
  PointMap,
  PointSet,
  toAscii,
  turnLeft,
  turnRight,
} from 'lib/coords';
import { ValuesOf } from 'lib/util';
import { compile, parse, Program } from './intcode';

const Color = {
  Black: 0,
  White: 1,
} as const;
type Color = ValuesOf<typeof Color>;

const Turn = {
  Left: 0,
  Right: 1,
} as const;
type Turn = ValuesOf<typeof Turn>;

type Grid = PointMap<Color>;

function paint(program: Program, startColor: Color): Grid {
  const robot = compile(program);
  const grid = new PointMap<Color>();
  let dir: Dir = Dir.Up;
  let cur = { x: 0, y: 0 };
  grid.set(cur, startColor);

  for (;;) {
    const [color, turn] = robot(grid.get(cur) || Color.Black) as [Color, Turn];
    if (robot.halted) break;
    grid.set(cur, color);
    dir = turn === Turn.Right ? turnRight(dir) : turnLeft(dir);
    cur = move(cur, dir);
  }
  return grid;
}

function toString(grid: Grid): string {
  return toAscii(
    new PointSet([...grid].filter(([, c]) => c === Color.White).map(([p]) => p))
  );
}

const program = parse(load().raw);
export default solve(
  () => paint(program, Color.Black).size,
  () => ocr(toString(paint(program, Color.White)), '4x6')
).expect(2252, 'AGALRGJE');
