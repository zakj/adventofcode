import { example, load, solve } from '../advent';
import {
  findBounds,
  neighbors4,
  pointHash as pointHash2,
  PointMap,
  PointSet,
} from '../coords';
import search from '../graph';
import { DefaultDict } from '../util';

type Point = { x: number; y: number };
type Map = {
  paths: PointSet;
  portals: PointMap<Point>;
  start: Point;
  end: Point;
};
const pointHash = ({ x, y }: Point): string => `${x},${y}`;

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
  function edgeWeights(p: Point): [Point, number][] {
    return [
      ...neighbors4(p).filter((p) => map.paths.has(p)),
      ...(map.portals.has(p) ? [map.portals.get(p)] : []),
    ].map((p) => [p, 1]);
  }
  return search(map.start, map.end, pointHash2, edgeWeights);
}

function shortestPathRecursive(map: Map): number {
  type RecursivePoint = Point & { layer: number };
  const rpHash = (rp: RecursivePoint) => [pointHash(rp), rp.layer].join(',');
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
    return Math.abs(rp.x - end.x) + Math.abs(rp.y - end.y) + rp.layer * 100;
  }

  const start = { ...map.start, layer: 0 };
  const end = { ...map.end, layer: 0 };
  return search(start, end, rpHash, edgeWeights, heuristic);
}

const ex1Map = parse(load('ex1').raw);
example.equal(shortestPath(ex1Map), 23);
const ex2Map = parse(load('ex2').raw);
example.equal(shortestPath(ex2Map), 58);

const map = parse(load().raw);
export default solve(
  () => shortestPath(map),
  () => shortestPathRecursive(map)
).expect(578, 6592);
