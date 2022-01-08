import { answers, example, load } from '../advent';
import { neighbors4, Point } from '../coords';
import search from '../graph';
import { ValuesOf, XMap } from '../util';

type State = {
  point: Point;
  tool: Tool;
};

const Type = {
  Rocky: '.',
  Wet: '=',
  Narrow: '|',
} as const;
type Type = ValuesOf<typeof Type>;
const Tool = {
  ClimbingGear: 'CG',
  Neither: '.',
  Torch: 'T',
} as const;
type Tool = ValuesOf<typeof Tool>;

function parse(lines: string[]): { target: any; depth: any } {
  const depth = Number(lines[0].split(': ')[1]);
  const [x, y] = lines[1].split(': ')[1].split(',').map(Number);
  return { target: { x, y }, depth };
}

function geologicIndex({ x, y }: Point, depth: number): number {
  if (x === 0 && y === 0) return 0;
  if (y === 0) return x * 16807;
  if (x === 0) return y * 48271;
  return (
    erosionLevel({ x: x - 1, y }, depth) * erosionLevel({ x, y: y - 1 }, depth)
  );
}

const erosionLevels = new XMap<{ p: Point; depth: number }, number>(
  ({ p, depth }) => `${p.x},${p.y}|${depth}`
);
function erosionLevel(p: Point, depth: number): number {
  if (!erosionLevels.has({ p, depth })) {
    erosionLevels.set({ p, depth }, (geologicIndex(p, depth) + depth) % 20183);
  }
  return erosionLevels.get({ p, depth });
}

function totalRisk(target: Point, depth: number): number {
  let riskNum = 0;
  for (let y = 0; y <= target.y; ++y) {
    for (let x = 0; x <= target.x; ++x) {
      if (x === target.x && y === target.y) continue; // 0 at target
      riskNum += erosionLevel({ x, y }, depth) % 3;
    }
  }
  return riskNum;
}

function passableWith(p: Point, depth: number, tool: Tool): boolean {
  const type = [Type.Rocky, Type.Wet, Type.Narrow][erosionLevel(p, depth) % 3];
  switch (tool) {
    case Tool.ClimbingGear:
      return type !== Type.Narrow;
    case Tool.Neither:
      return type !== Type.Rocky;
    case Tool.Torch:
      return type !== Type.Wet;
  }
}

function serialize({ point, tool }: State): string {
  return `${point.x},${point.y}:${tool}`;
}

function edgeWeights(depth: number) {
  return function edgeWeights({ point, tool }: State): [State, number][] {
    const edges: [State, number][] = neighbors4(point)
      .filter((p) => p.x >= 0 && p.y >= 0 && passableWith(p, depth, tool))
      .map((point) => [{ point, tool }, 1]);
    const nextTool = Object.values(Tool).find(
      (t) => t !== tool && passableWith(point, depth, t)
    );
    edges.push([{ point, tool: nextTool }, 7]);
    return edges;
  };
}

function rescue(target: Point, depth: number): number {
  const start = { point: { x: 0, y: 0 }, tool: Tool.Torch };
  const goal = { point: target, tool: Tool.Torch };
  erosionLevels.set({ p: target, depth }, 0); // hack to avoid passing target around
  return search(
    start,
    goal,
    serialize,
    edgeWeights(depth),
    ({ point }) => Math.abs(point.x - target.x) + Math.abs(point.y - target.y)
  );
}

const exampleTarget = { x: 10, y: 10 };
const exampleDepth = 510;
example.equal(totalRisk(exampleTarget, exampleDepth), 114);
example.equal(rescue(exampleTarget, exampleDepth), 45);

const { target, depth } = parse(load(22).lines);
answers.expect(10115, 990);
answers(
  () => totalRisk(target, depth),
  () => rescue(target, depth)
);
