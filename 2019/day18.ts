import { example, load, solve } from 'lib/advent';
import { neighbors4, Point, pointHash, PointMap, PointSet } from 'lib/coords';
import { minDistance, minPath } from 'lib/graph';
import { combinations } from 'lib/util';

type MapData = {
  start: Point;
  keys: PointMap<string>;
  keyLocations: Map<string, Point>;
  doors: PointMap<string>;
  paths: PointSet;
};

type Node = {
  key: string;
  point: Point;
};
type Edge = {
  cost: number;
  keys: number;
};
type EdgeMap = Map<string, Map<string, Edge>>;
type State = [string[], Keyring];

class Keyring {
  private static aOffset = 'a'.charCodeAt(0);
  bitmap = 0;

  private keyToInt(key: string): number {
    return 1 << (key.charCodeAt(0) - Keyring.aOffset);
  }

  has(key: string): boolean {
    return !!(this.bitmap & this.keyToInt(key));
  }

  hasAll(other: number): boolean;
  hasAll(other: Keyring): boolean;
  hasAll(other: number | Keyring): boolean {
    const bitmap = typeof other === 'number' ? other : other.bitmap;
    return (this.bitmap & bitmap) === bitmap;
  }

  with(key: string): Keyring {
    const ring = new Keyring();
    ring.bitmap = this.bitmap | ring.keyToInt(key);
    return ring;
  }

  toString() {
    return this.bitmap.toString();
  }
}

function parse(lines: string[]): MapData {
  const keys = new PointMap<string>();
  const keyLocations = new Map<string, Point>();
  const doors = new PointMap<string>();
  const paths = new PointSet();
  const width = lines[0].length;
  const height = lines.length;
  let start: Point;
  for (let y = 0; y < height; ++y) {
    const row = lines[y];
    for (let x = 0; x < width; ++x) {
      const c = row[x];
      if (c === '@') {
        start = { x, y };
        paths.add({ x, y });
      } else if (c === '.') {
        paths.add({ x, y });
      } else if (c.match(/[a-z]/)) {
        keys.set({ x, y }, c);
        keyLocations.set(c, { x, y });
        paths.add({ x, y });
      } else if (c.match(/[A-Z]/)) {
        doors.set({ x, y }, c.toLowerCase());
      } else if (c === '#') {
        // wall, no-op
      } else {
        throw new Error(JSON.stringify({ c, x, y }));
      }
    }
  }
  return { start, keys, keyLocations, doors, paths };
}

function buildGraph(map: MapData, starts: Node[]): EdgeMap {
  const nodes = [...map.keyLocations].map(([key, point]) => ({ key, point }));
  for (const start of starts) nodes.push(start);
  const edgeMap = new Map<string, Map<string, Edge>>();
  for (const node of nodes) edgeMap.set(node.key, new Map<string, Edge>());

  const edges = (p: Point) =>
    neighbors4(p).filter((p) => map.paths.has(p) || map.doors.has(p));

  for (const [a, b] of combinations(nodes)) {
    const path = minPath(a.point, pointHash, { goal: b.point, edges });
    if (!path) continue;
    const doors = path
      .map((p) => map.doors.get(p))
      .filter(Boolean)
      .reduce((keyring, k) => keyring.with(k), new Keyring());
    const edge = { cost: path.length - 1, keys: doors.bitmap };
    edgeMap.get(a.key).set(b.key, edge);
    edgeMap.get(b.key).set(a.key, edge);
  }
  return edgeMap;
}

function shortestPath(map: MapData, starts: Point[] = [map.start]): number {
  const startNodes = starts.map((p, i) => ({ key: `@${i}`, point: p }));
  const graph = buildGraph(map, startNodes);
  const start: State = [startNodes.map((x) => x.key), new Keyring()];

  // TODO: I'm not entirely sure why this part2 hash optimization works, but I
  // ran into it accidentally and it does...
  const h =
    starts.length === 1
      ? ([starts, keyring]) => `${starts[0]}|${keyring}`
      : ([, keyring]) => keyring.bitmap;

  function edgeWeights([starts, keyring]: State) {
    return starts.flatMap((k, i) => {
      const edges = graph.get(k);
      return [...edges]
        .filter(([k, { keys }]) => !keyring.has(k) && keyring.hasAll(keys))
        .map(([to, { cost }]) => {
          const nextStarts = starts.slice();
          nextStarts.splice(i, 1, to);
          return [[nextStarts, keyring.with(to)], cost] as [State, number];
        });
    });
  }

  let allKeys = new Keyring();
  for (const k of map.keys.values()) allKeys = allKeys.with(k);
  const goalFn = ([, keyring]) => keyring.hasAll(allKeys);

  return minDistance(start, h, { goalFn, edgeWeights });
}

const ex1 = parse(load('ex1').lines);
example.equal(shortestPath(ex1), 132);
const ex2 = parse(load('ex2').lines);
example.equal(shortestPath(ex2), 136);

const map = parse(load().lines);
export default solve(
  () => shortestPath(map),
  () => {
    map.paths.delete(map.start);
    map.paths.delete({ x: map.start.x - 1, y: map.start.y });
    map.paths.delete({ x: map.start.x + 1, y: map.start.y });
    map.paths.delete({ x: map.start.x, y: map.start.y - 1 });
    map.paths.delete({ x: map.start.x, y: map.start.y + 1 });
    const starts = [
      { x: map.start.x - 1, y: map.start.y - 1 },
      { x: map.start.x - 1, y: map.start.y + 1 },
      { x: map.start.x + 1, y: map.start.y - 1 },
      { x: map.start.x + 1, y: map.start.y + 1 },
    ];
    for (const p of starts) {
      map.paths.add(p);
    }
    return shortestPath(map, starts);
  }
).expect(4668, 1910);
