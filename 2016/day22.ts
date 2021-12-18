import { answers, example, load } from '../advent';
import { combinations } from '../util';

type Node = {
  x: number;
  y: number;
};
type FullNode = Node & {
  size: number;
  used: number;
  avail: number;
  pctUsed: number;
};
type FS = FullNode[];

function parse(lines: string[]): FS {
  const num = (x: string): number => Number(x.replaceAll(/[^\d]/g, ''));
  return lines.map((line) => {
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

function simplify(node: FullNode): Node {
  return { x: node.x, y: node.y };
}

function hashify(...nodes: Node[]): string {
  return JSON.stringify(nodes.map(({ x, y }) => [x, y]));
}

function neighbors(node: Node, w: number, h: number): Node[] {
  return [-1, 1]
    .flatMap((d) => [
      { x: node.x + d, y: node.y },
      { x: node.x, y: node.y + d },
    ])
    .filter((node) => node.x >= 0 && node.x < w && node.y >= 0 && node.y < h);
}

function same(a: Node, b: Node) {
  return a.x === b.x && a.y === b.y;
}

function printFs(
  empty: Node,
  goal: Node,
  walls: Node[],
  width: number,
  height: number
) {
  for (let y = 0; y < width; ++y) {
    const rr = [];
    for (let x = 0; x < height; ++x) {
      const v =
        x === empty.x && y === empty.y
          ? '_'
          : x === goal.x && y === goal.y
          ? 'G'
          : walls.some((n) => n.x === x && n.y === y)
          ? '#'
          : '.';
      rr.push(x === 0 && y === 0 ? `(${v})` : ` ${v} `);
    }
    console.log(rr.join(''));
  }
  console.log();
}

function shortestPath(fs: FS): number {
  const width = fs.reduce((max, n) => (n.x > max ? n.x : max), 0) + 1;
  const height = fs.reduce((max, n) => (n.y > max ? n.y : max), 0) + 1;
  const goal = simplify(fs.find((n) => n.x === width - 1 && n.y === 0));
  const emptySize = fs.find((n) => n.used === 0).size;
  const empty = simplify(fs.find((n) => n.used === 0));
  const walls = fs.filter((n) => n.used > emptySize).map(simplify);

  const visited = new Set<string>();
  const q = [{ goal, empty, steps: 0 }];
  while (q.length) {
    let { goal, empty, steps } = q.shift();
    if (goal.x === 0 && goal.y === 0) return steps;
    steps++;
    for (let node of neighbors(empty, width, height)) {
      let newGoal = same(node, goal) ? empty : goal;
      let newEmpty = node;
      const key = hashify(newEmpty, newGoal);
      if (visited.has(key)) continue;
      visited.add(key);
      if (walls.some((wall) => wall.x === node.x && wall.y === node.y))
        continue;
      q.push({ empty: newEmpty, goal: newGoal, steps });
    }
  }
}

const exampleFs = parse(load(22, 'ex').lines.slice(2));
example.equal(shortestPath(exampleFs), 7);

const fs = parse(load(22).lines.slice(2));
answers.expect(872, 211);
answers(
  () => viablePairs(fs).length,
  () => shortestPath(fs)
);
