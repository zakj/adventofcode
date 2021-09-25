import { answers, example, load } from '../advent';
import { XMap, XSet } from '../util';

type Point = { x: number; y: number };
const h = ({ x, y }: Point) => `${x},${y}`;

type MapData = {
  start: Point;
  keys: XMap<Point, string>;
  keyLocations: Map<string, Point>;
  doors: XMap<Point, string>;
  paths: XSet<Point>;
};

class Keyring {
  private aOffset = 'a'.charCodeAt(0);
  private bitmap = 0;
  private _size = 0;

  private keyToInt(key: string): number {
    return 1 << (key.charCodeAt(0) - this.aOffset);
  }

  has(key: string): boolean {
    return !!(this.bitmap & this.keyToInt(key));
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
  const keys = new XMap<Point, string>(h);
  const keyLocations = new Map<string, Point>();
  const doors = new XMap<Point, string>(h);
  const paths = new XSet<Point>(h);
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

function walkableFrom(
  { x, y }: Point,
  map: MapData,
  keyring: Keyring
): Point[] {
  return [-1, 1]
    .flatMap((d) => [
      { x: x + d, y },
      { x, y: y + d },
    ])
    .filter(
      (p: Point) =>
        map.paths.has(p) || (map.doors.has(p) && keyring.has(map.doors.get(p)))
    );
}

type State = [Point[], Keyring];

function reachableKeyDistances(
  map: MapData,
  start: Point,
  keyring: Keyring
): XMap<Point, number> {
  const distances = new XMap<Point, number>(h, [[start, 0]]);
  const keyDistances = new XMap<Point, number>(h);
  const q = [start];

  while (q.length) {
    const cur = q.shift();
    for (const point of walkableFrom(cur, map, keyring)) {
      if (distances.has(point)) continue;
      distances.set(point, distances.get(cur) + 1);
      if (map.keys.has(point) && !keyring.has(map.keys.get(point))) {
        keyDistances.set(point, distances.get(point));
      } else {
        q.push(point);
      }
    }
  }

  return keyDistances;
}

function shortestPath(
  map: MapData,
  starts: Point[] = [map.start],
  keyring: Keyring = new Keyring(),
  cache = new XMap<State, number>(
    ([points, keyring]) => `${points.map((p) => h(p)).join('|')}|${keyring}`
  )
) {
  if (cache.has([starts, keyring])) return cache.get([starts, keyring]);
  let shortest = 0;

  const reachables = starts.map((start) =>
    reachableKeyDistances(map, start, keyring)
  );
  if (reachables.some((r) => r.size)) {
    const options = reachables.flatMap((reachable, i) =>
      reachable.entries().map(([point, distance]) => {
        const nextStarts = starts.slice();
        nextStarts.splice(i, 1, point);
        return (
          shortestPath(
            map,
            nextStarts,
            keyring.with(map.keys.get(point)),
            cache
          ) + distance
        );
      })
    );
    shortest = Math.min(...options);
  }

  cache.set([starts, keyring], shortest);
  return shortest;
}

const ex1 = parse(load(18, 'ex1').lines);
example.equal(shortestPath(ex1), 132);
const ex2 = parse(load(18, 'ex2').lines);
example.equal(shortestPath(ex2), 136);

const map = parse(load(18).lines);
answers.expect(4668, 1910);
answers(
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
);