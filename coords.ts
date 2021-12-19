import { range, ValuesOf, XMap, XSet } from './util';

export type Point = { x: number; y: number };
export type PointHash = number;
export const pointToString = ({ x, y }: Point): string => `${x},${y}`;

export type Rect = {
  min: Point;
  max: Point;
};

export const Dir = {
  Up: 0,
  Right: 1,
  Down: 2,
  Left: 3,
};
export type Dir = ValuesOf<typeof Dir>;

// https://en.wikipedia.org/wiki/Pairing_function
function cantorPairSigned({ x, y }: Point): number {
  const a = x >= 0 ? 2 * x : -2 * x - 1;
  const b = y >= 0 ? 2 * y : -2 * y - 1;
  return 0.5 * (a + b) * (a + b + 1) + b;
}

export class PointMap<T> extends XMap<Point, T, PointHash> {
  constructor(iterable: Iterable<[Point, T]> = []) {
    super(cantorPairSigned, iterable);
  }
}

export class PointSet extends XSet<Point, PointHash> {
  constructor(iterable: Iterable<Point> = []) {
    super(cantorPairSigned, iterable);
  }
}

export function parseMap<T>(
  lines: string[],
  valMap: (c: string) => T
): PointMap<T> {
  return new PointMap(
    lines.flatMap((line, y) =>
      line.split('').map((c, x): [Point, T] => [{ x, y }, valMap(c)])
    )
  );
}

export function parseSet(lines: string[]): PointSet {
  return new PointSet(
    lines.map((line) => {
      const [x, y] = line.split(',', 2).map(Number);
      return { x, y };
    })
  );
}

export function neighbors4({ x, y }: Point): Point[] {
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];
}

export function neighbors8({ x, y }: Point): Point[] {
  return [
    ...neighbors4({ x, y }),
    { x: x - 1, y: y - 1 },
    { x: x - 1, y: y + 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y + 1 },
  ];
}

export function add(a: Point, b: Partial<Point>): Point {
  return { x: a.x + (b.x || 0), y: a.y + (b.y || 0) };
}

export function move(p: Point, dir: Dir): Point {
  switch (dir) {
    case Dir.Up:
      return add(p, { y: -1 });
    case Dir.Right:
      return add(p, { x: 1 });
    case Dir.Down:
      return add(p, { y: 1 });
    case Dir.Left:
      return add(p, { x: -1 });
  }
}

export function findBounds<T>(points: PointMap<T>): { min: Point; max: Point };
export function findBounds(points: PointSet): { min: Point; max: Point };
export function findBounds(points: Point[]): { min: Point; max: Point };
export function findBounds<T>(points: PointMap<T> | PointSet | Point[]): {
  min: Point;
  max: Point;
} {
  if (points instanceof PointMap) points = points.keys();
  else if (points instanceof PointSet) points = [...points];
  return points.reduce(
    (rv, p) => {
      rv.min.x = Math.min(rv.min.x, p.x);
      rv.min.y = Math.min(rv.min.y, p.y);
      rv.max.x = Math.max(rv.max.x, p.x);
      rv.max.y = Math.max(rv.max.y, p.y);
      return rv;
    },
    {
      min: { x: Infinity, y: Infinity },
      max: { x: -Infinity, y: -Infinity },
    }
  );
}

function setToMap(set: PointSet): PointMap<boolean> {
  return new PointMap([...set].map((k) => [k, true]));
}

export function intersect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.min.x &&
    point.x <= rect.max.x &&
    point.y >= rect.min.y &&
    point.y <= rect.max.y
  );
}

export function toAscii(set: PointSet, char?: string): string;
export function toAscii<T>(map: PointMap<T>): string;
export function toAscii<T>(
  mapOrSet: PointMap<T> | PointSet,
  char: string = '#'
): string {
  let map = mapOrSet instanceof PointMap ? mapOrSet : setToMap(mapOrSet);
  const { min, max } = findBounds(map.keys());
  return range(min.y, max.y + 1)
    .map((y) =>
      range(min.x, max.x + 1)
        .map((x) => (map.has({ x, y }) ? map.get({ x, y }) : ' '))
        .map((v) => (v === true ? char : v)) // handle set
        .join('')
    )
    .join('\n');
}
