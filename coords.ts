import { range, XMap, XSet } from './util';

export type Point = { x: number; y: number };
export type PointHash = string;
export const pointHash = ({ x, y }: Point): PointHash => `${x},${y}`;

export class PointMap<T> extends XMap<Point, T, PointHash> {
  constructor(iterable: Iterable<[Point, T]> = []) {
    super(pointHash, iterable);
  }
}

export class PointSet extends XSet<Point> {
  constructor(iterable: Iterable<Point> = []) {
    super(pointHash, iterable);
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

export function findBounds(points: Point[]): { min: Point; max: Point } {
  const min = { x: Infinity, y: Infinity };
  const max = { x: -Infinity, y: -Infinity };
  for (const p of points) {
    min.x = Math.min(min.x, p.x);
    min.y = Math.min(min.y, p.y);
    max.x = Math.max(max.x, p.x);
    max.y = Math.max(max.y, p.y);
  }
  return { min, max };
}

function setToMap(set: PointSet): PointMap<boolean> {
  return new PointMap([...set].map((k) => [k, true]));
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
