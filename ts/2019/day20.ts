import { main } from 'lib/advent';
import { DefaultDict } from 'lib/collections';
import {
  findBounds,
  neighbors4,
  pointHash,
  PointMap,
  PointSet,
} from 'lib/coords';
import { minDistance } from 'lib/graph';

type Point = { x: number; y: number };
type Map = {
  paths: PointSet;
  portals: PointMap<Point>;
  start: Point;
  end: Point;
};

function parse(s: string): Map {
  const lines = s.split('\n');
  const paths = new PointSet();
  const portals = new PointMap<Point>();
  const letters = new PointMap<string>();

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
    const neighborPaths = neighbors4(p).filter((p) => paths.has(p));
    const neighborLetters = neighbors4(p).filter((p) => letters.has(p));
    if (neighborPaths.length === 0) {
      neighborPaths.push(
        ...neighbors4(neighborLetters[0]).filter((p) => paths.has(p))
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

function shortestPath(map: Map): number {
  const edges = (p: Point) => [
    ...neighbors4(p).filter((p) => map.paths.has(p)),
    ...(map.portals.has(p) ? [map.portals.get(p)] : []),
  ];
  return minDistance(map.start, pointHash, { goal: map.end, edges });
}

function shortestPathRecursive(map: Map): number {
  type RecursivePoint = Point & { layer: number };
  const rpHash = (rp: RecursivePoint) => `${pointHash(rp)},${rp.layer}`;
  const bounds = findBounds(new PointMap(map.portals));
  const onBoundary = (p: Point) =>
    bounds.min.x === p.x ||
    bounds.max.x === p.x ||
    bounds.min.y === p.y ||
    bounds.max.y === p.y;

  function edgeWeights(rp: RecursivePoint): [RecursivePoint, number][] {
    const edges: [RecursivePoint, number][] = [
      ...neighbors4(rp).filter((p) => map.paths.has(p)),
    ].map((p) => [{ ...p, layer: rp.layer }, 1]);
    const portal = map.portals.get(rp);
    if (portal) {
      const layer = rp.layer + (onBoundary(rp) ? -1 : 1);
      if (layer >= 0) edges.push([{ ...portal, layer }, 1]);
    }
    return edges;
  }

  function heuristic(rp: RecursivePoint): number {
    return Math.abs(rp.x - goal.x) + Math.abs(rp.y - goal.y) + rp.layer * 100;
  }

  const start = { ...map.start, layer: 0 };
  const goal = { ...map.end, layer: 0 };
  return minDistance(start, rpHash, { goal, edgeWeights, heuristic });
}

main(
  (s) => shortestPath(parse(s)),
  (s) => shortestPathRecursive(parse(s))
);
