import { answers, example } from '../advent';
import { PriorityQueue, sum, XMap } from '../util';

type Point = { x: number; y: number };
enum Type {
  Rocky = '.',
  Wet = '=',
  Narrow = '|',
}
enum Tool {
  ClimbingGear = 'CG',
  Neither = '.',
  Torch = 'T',
}

function geologicIndex({ x, y }: Point, depth: number): number {
  if (x === 0 && y === 0) return 0;
  // Handle this elsewhere to avoid passing target around.
  // if (x === target.x && y === target.y) return 0
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

function risk(target: Point, depth: number): number {
  const riskMap = new XMap<Point, number>(({ x, y }) => `${x},${y}`);
  let riskNum = 0;
  for (let y = 0; y <= target.y; ++y) {
    for (let x = 0; x <= target.x; ++x) {
      if (x === target.x && y === target.y) continue; // save passing it all the way through
      riskMap.set({ x, y }, erosionLevel({ x, y }, depth) % 3);
      riskNum += erosionLevel({ x, y }, depth) % 3;
    }
  }
  return sum(riskMap.values());
}

function adjacent({ x, y }: Point): Point[] {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ].filter(({ x, y }) => x >= 0 && y >= 0);
}

function type(p: Point, depth: number): Type {
  return [Type.Rocky, Type.Wet, Type.Narrow][erosionLevel(p, depth) % 3];
}

const passableWith: Record<Tool, Set<Type>> = {
  [Tool.ClimbingGear]: new Set([Type.Rocky, Type.Wet]),
  [Tool.Neither]: new Set([Type.Narrow, Type.Wet]),
  [Tool.Torch]: new Set([Type.Narrow, Type.Rocky]),
};

function walk(target: Point, depth: number): number {
  type Key = { p: Point; tool: Tool };
  const h = ({ p, tool }: Key) => `${p.x},${p.y}|${tool}`;
  const start = { p: { x: 0, y: 0 }, tool: Tool.Torch };
  erosionLevels.set({ p: target, depth }, 0); // hack

  const distance = new XMap<Key, number>(h);
  const q = new PriorityQueue<Key>((k) =>
    distance.has(k) ? distance.get(k) : Infinity
  );
  distance.set(start, 0);
  q.add(start);

  while (q.length) {
    const { p, tool } = q.shift();
    if (p.x > target.x * 3 || p.y > target.y * 3) continue; // best guess

    const curSteps = distance.get({ p, tool });
    const neighbors: [Key, number][] = adjacent(p)
      .filter((n) => passableWith[tool].has(type(n, depth)))
      .map((n) => [{ p: n, tool }, curSteps + 1]);
    const otherTool = [Tool.ClimbingGear, Tool.Neither, Tool.Torch].find(
      (t) => t !== tool && passableWith[t].has(type(p, depth))
    );
    neighbors.push([{ p, tool: otherTool }, curSteps + 7]);

    for (const [key, steps] of neighbors) {
      if (steps < (distance.has(key) ? distance.get(key) : Infinity)) {
        distance.set(key, steps);
        q.add(key);
      }
    }
  }

  return distance.get({ p: target, tool: Tool.Torch });
}

const exampleDepth = 510;
const exampleTarget = { x: 10, y: 10 };

example.equal(risk(exampleTarget, exampleDepth), 114);
example.equal(walk(exampleTarget, exampleDepth), 45);

const depth = 3066;
const target = { x: 13, y: 726 };
answers.expect(10115, 990);
answers(
  () => risk(target, depth),
  () => walk(target, depth)
);
