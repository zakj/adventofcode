import { answers, example, load } from '../advent';
import { DefaultDict, XMap, XSet } from '../util';

type Point = { x: number; y: number };
type Map = {
  paths: XSet<Point>;
  portals: XMap<Point, Point>;
  start: Point;
  end: Point;
};
const pointHash = ({ x, y }: Point): string => `${x},${y}`;

function parse(s: string): Map {
  const lines = s.split('\n');
  const paths = new XSet<Point>(pointHash);
  const portals = new XMap<Point, Point>(pointHash);
  const letters = new XMap<Point, string>(pointHash);

  for (let y = 0; y < lines.length; ++y) {
    const line = lines[y];
    for (let x = 0; x < line.length; ++x) {
      const c = line[x];
      if (c === '.') {
        paths.add({ x, y });
      } else if (c.match(/[A-Z]/)) {
        letters.set({ x, y }, c);
      }
    }
  }

  const portalList = new DefaultDict<string, Point[]>(() => []);
  for (const [p, letter] of letters) {
    const neighborPaths = neighbors(p).filter((p) => paths.has(p));
    const neighborLetters = neighbors(p).filter((p) => letters.has(p));
    if (neighborPaths.length === 0) {
      neighborPaths.push(
        ...neighbors(neighborLetters[0]).filter((p) => paths.has(p))
      );
    }
    if (neighborPaths.length !== 1 || neighborLetters.length !== 1) {
      throw 'parse error';
    }
    const pOther = neighborLetters[0];
    const other = letters.get(pOther);
    letters.delete(neighborLetters[0]); // avoid double work
    // there can be two different portals, AB and BA
    let name = letter + other;
    if (p.x > pOther.x || p.y > pOther.y) name = other + letter;
    portalList.get(name).push(neighborPaths[0]);
  }

  let start: Point;
  let end: Point;
  for (const [name, points] of portalList) {
    if (name === 'AA') {
      if (points.length !== 1) throw 'parse error';
      start = points[0];
    } else if (name === 'ZZ') {
      if (points.length !== 1) throw 'parse error';
      end = points[0];
    } else {
      if (points.length !== 2) throw `parse error ${name}`;
      portals.set(points[0], points[1]);
      portals.set(points[1], points[0]);
    }
  }

  return { paths, portals, start, end };
}

function neighbors({ x, y }: Point): Point[] {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ];
}

const walkableNeighbors = (map: Map, p: Point): Point[] => [
  ...neighbors(p).filter((p) => map.paths.has(p)),
  ...(map.portals.has(p) ? [map.portals.get(p)] : []),
];

function shortestPath(map: Map): number {
  const visited = new XSet<Point>(pointHash, [map.start]);
  const q: [Point, number][] = [[map.start, 0]];
  const hEnd = pointHash(map.end);
  while (q.length) {
    const [cur, steps] = q.shift();
    if (pointHash(cur) === hEnd) return steps;
    for (const next of walkableNeighbors(map, cur)) {
      if (visited.has(next)) continue;
      visited.add(next);
      q.push([next, steps + 1]);
    }
  }
  return -1;
}

function shortestPathRecursive(map: Map): number {
  type RecursivePoint = Point & { layer: number };
  const rpHash = ({ x, y, layer }: RecursivePoint): string =>
    `${x},${y},${layer}`;
  const visited = new XSet<RecursivePoint>(rpHash, [
    { ...map.start, layer: 0 },
  ]);
  const q: [RecursivePoint, number][] = [[{ ...map.start, layer: 0 }, 0]];
  const hEnd = rpHash({ ...map.end, layer: 0 });

  const bounds = {
    x: [
      Math.min(...map.portals.keys().map((p) => p.x)),
      Math.max(...map.portals.keys().map((p) => p.x)),
    ],
    y: [
      Math.min(...map.portals.keys().map((p) => p.y)),
      Math.max(...map.portals.keys().map((p) => p.y)),
    ],
  };
  const onBoundary = (p: Point): boolean =>
    bounds.x.includes(p.x) || bounds.y.includes(p.y);

  while (q.length) {
    const [cur, steps] = q.shift();
    if (rpHash(cur) === hEnd) return steps;
    for (const next of neighbors(cur).filter((p) => map.paths.has(p))) {
      const nl = { ...next, layer: cur.layer };
      if (visited.has(nl)) continue;
      visited.add(nl);
      q.push([nl, steps + 1]);
    }
    const portalDestination = map.portals.get(cur);
    if (portalDestination) {
      const nl = {
        ...portalDestination,
        layer: cur.layer + (onBoundary(cur) ? -1 : 1),
      };
      if (nl.layer < 0 || visited.has(nl)) continue;
      visited.add(nl);
      q.push([nl, steps + 1]);
    }
  }
  return -1;
}

const ex1Map = parse(load(20, 'ex1').raw);
example.equal(shortestPath(ex1Map), 23);
const ex2Map = parse(load(20, 'ex2').raw);
example.equal(shortestPath(ex2Map), 58);

const map = parse(load(20).raw);
answers.expect(578, 6592);
answers(
  () => shortestPath(map),
  () => shortestPathRecursive(map)
);
