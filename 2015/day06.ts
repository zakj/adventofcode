import { load, solve } from 'lib/advent';
import { Point, PointGrid, Rect } from 'lib/coords';
import { range, sum, ValuesOf } from 'lib/util';

const Action = {
  Off: 0,
  On: 1,
  Toggle: 2,
} as const;
type Action = ValuesOf<typeof Action>;

type Instruction = {
  action: Action;
  rect: Rect;
};

function parse(lines: string[]): Instruction[] {
  const instructions = [];
  const toAction: Record<string, Action> = {
    'turn off': Action.Off,
    'turn on': Action.On,
    toggle: Action.Toggle,
  };
  const ranges = /(\d+),(\d+) through (\d+),(\d+)/;
  return lines.map((line) => {
    const action = toAction[line.split(/ \d/, 1)[0]];
    const [x0, y0, x1, y1] = ranges.exec(line).slice(1).map(Number);
    return { action, rect: { min: { x: x0, y: y0 }, max: { x: x1, y: y1 } } };
  });
}

function applyInstructions(
  instructions: Instruction[],
  reducer: (p: Point, grid: PointGrid<number>, action: Action) => number
): PointGrid<number> {
  const grid = PointGrid.from(
    new Array(1000).fill(null).map(() => new Array(1000).fill(0))
  );
  return instructions.reduce((grid, { action, rect }) => {
    for (const x of range(rect.min.x, rect.max.x + 1)) {
      for (const y of range(rect.min.y, rect.max.y + 1)) {
        grid.set(x, y, reducer({ x, y }, grid, action));
      }
    }
    return grid;
  }, grid);
}

const instructions = parse(load().lines);
export default solve(
  () =>
    applyInstructions(instructions, (p, grid, action) =>
      action === Action.On ? 1 : action === Action.Off ? 0 : grid.get(p) ? 0 : 1
    ).filter(Boolean).length,
  () =>
    sum(
      applyInstructions(instructions, (p, grid, action) =>
        action === Action.On
          ? grid.get(p) + 1
          : action === Action.Off
          ? Math.max(0, grid.get(p) - 1)
          : grid.get(p) + 2
      ).filter(Boolean)
    )
).expect(543903, 14687245);
