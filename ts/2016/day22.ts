import { main } from 'lib/advent';
import { neighbors4, parseGrid, Point, pointHash } from 'lib/coords';
import { minDistance } from 'lib/graph';
import { iter } from 'lib/iter';
import { combinations, lines } from 'lib/util';

type FullNode = Point & {
  size: number;
  used: number;
  avail: number;
  pctUsed: number;
};
type FS = FullNode[];
type State = { empty: Point; goal: Point };

function parse(s: string): FS {
  const num = (x: string): number => Number(x.replaceAll(/[^\d]/g, ''));
  return lines(s)
    .slice(2)
    .map((line) => {
      const [path, size, used, avail, pct] = line.split(/\s+/);
      const node = path.split('-');
      return {
        x: num(node[1]),
        y: num(node[2]),
        size: num(size),
        used: num(used),
        avail: num(avail),
        pctUsed: num(pct),
      };
    });
}

function viablePairs(fs: FS): [FullNode, FullNode][] {
  const pairs = [];
  const isViable = (a, b) => a.used > 0 && a.used <= b.avail;
  [...combinations(fs)].forEach(([a, b]) => {
    if (isViable(a, b)) pairs.push([a, b]);
    if (isViable(b, a)) pairs.push([b, a]);
  });
  return pairs;
}

function isSamePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function shortestPath(fs: FS): number {
  const width = iter(fs).pluck('x').max() + 1;
  const height = iter(fs).pluck('y').max() + 1;
  const goal = { x: width - 1, y: 0 };
  const emptyNode = fs.find((n) => n.used === 0);
  const empty: Point = emptyNode;
  const grid = parseGrid(
    new Array(height).fill(0).map(() => '.'.repeat(width)),
    () => true
  );
  fs.filter((n) => n.used > emptyNode.size).forEach((p) => grid.set(p, false));

  function edgeWeights({ empty, goal }: State): [State, number][] {
    return neighbors4(empty)
      .filter((node) => grid.get(node))
      .map((node) => {
        const newGoal = isSamePoint(node, goal) ? empty : goal;
        return [{ empty: node, goal: newGoal }, 1];
      });
  }

  const hashState = ({ goal, empty }: State) =>
    `${pointHash(goal)}|${pointHash(empty)}`;

  return minDistance({ goal, empty }, hashState, {
    goalFn: ({ goal }) => goal.x === 0 && goal.y === 0,
    edgeWeights,
    heuristic: ({ goal }) => goal.x + goal.y,
  });
}

main(
  (s) => viablePairs(parse(s)).length,
  (s) => shortestPath(parse(s))
);
