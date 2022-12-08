import { pairingSzudzikSigned, range, ValuesOf, XMap, XSet } from 'lib/util';

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
} as const;
export type Dir = ValuesOf<typeof Dir>;
export const turnLeft: (dir: Dir) => Dir = (dir) => ((dir + 3) % 4) as Dir;
export const turnAround: (dir: Dir) => Dir = (dir) => ((dir + 2) % 4) as Dir;
export const turnRight: (dir: Dir) => Dir = (dir) => ((dir + 1) % 4) as Dir;

// More performant version of PointMap for dense, stably-sized grids.
export class PointGrid<T> {
  width: number;
  height: number;
  private _arr: T[] = [];
  private _xs: number[] = [];
  private _ys: number[] = [];

  static from<T>(grid: T[][]): PointGrid<T> {
    const g = new PointGrid<T>();
    g.width = grid[0].length;
    g.height = grid.length;
    g._arr = grid.flat(1);
    return g;
  }

  copy(): PointGrid<T> {
    const g = new PointGrid<T>();
    g.width = this.width;
    g.height = this.height;
    g._arr = this._arr.slice();
    return g;
  }

  private _index(point: Point): number {
    return point.y * this.width + point.x;
  }

  get xs(): number[] {
    if (!this._xs.length) this._xs = range(0, this.width);
    return this._xs;
  }

  get ys(): number[] {
    if (!this._ys.length) this._ys = range(0, this.height);
    return this._ys;
  }

  get({ x, y }: Point): T;
  get(x: number, y: number): T;
  get(xOrPoint: number | Point, y?: number): T {
    if (typeof xOrPoint === 'number') xOrPoint = { x: xOrPoint, y };
    return this.has(xOrPoint) ? this._arr[this._index(xOrPoint)] : undefined;
  }

  has({ x, y }: Point): boolean;
  has(x: number, y: number): boolean;
  has(xOrPoint: number | Point, y?: number): boolean {
    if (typeof xOrPoint === 'number') xOrPoint = { x: xOrPoint, y };
    return (
      xOrPoint.x >= 0 &&
      xOrPoint.x < this.width &&
      xOrPoint.y >= 0 &&
      xOrPoint.y < this.height
    );
  }

  set({ x, y }: Point, value: T): void;
  set(x: number, y: number, value: T): void;
  set(xOrPoint: number | Point, yOrValue: number | T, value?: T): void {
    if (typeof xOrPoint === 'number')
      xOrPoint = { x: xOrPoint, y: yOrValue as number };
    else value = yOrValue as T;
    this._arr[this._index(xOrPoint)] = value;
  }

  filter(predicate: (value: T) => boolean): T[] {
    return this._arr.filter(predicate);
  }

  *map<U>(project: (val: T, p: Point) => U): Generator<U> {
    for (const x of this.xs) {
      for (const y of this.ys) {
        yield project(this.get(x, y), { x, y });
      }
    }
  }
}

export function pointHash({ x, y }: Point): number {
  return pairingSzudzikSigned(x, y);
}

export class PointMap<T> extends XMap<Point, T, PointHash> {
  constructor(iterable: Iterable<[Point, T]> = []) {
    super(pointHash, iterable);
  }
}

export class PointSet extends XSet<Point, PointHash> {
  constructor(iterable: Iterable<Point> = []) {
    super(pointHash, iterable);
  }
}

export function parseGrid<T>(
  lines: string[],
  valMap: (c: string) => T
): PointGrid<T> {
  return PointGrid.from(lines.map((line) => line.split('').map(valMap)));
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
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
    { x: x - 1, y: y - 1 },
    { x: x - 1, y: y + 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y + 1 },
  ];
}

export function add(a: Point, b: Partial<Point>): Point {
  return { x: a.x + (b.x ?? 0), y: a.y + (b.y ?? 0) };
}

export function move(p: Point, dir: Dir, n = 1): Point {
  switch (dir) {
    case Dir.Up:
      return add(p, { y: -1 * n });
    case Dir.Right:
      return add(p, { x: 1 * n });
    case Dir.Down:
      return add(p, { y: 1 * n });
    case Dir.Left:
      return add(p, { x: -1 * n });
  }
}

export function findBounds<T>(points: PointMap<T>): Rect;
export function findBounds(points: PointSet): Rect;
export function findBounds(points: Point[]): Rect;
export function findBounds<T>(points: PointMap<T> | PointSet | Point[]): Rect {
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
  char = '#'
): string {
  const map = mapOrSet instanceof PointMap ? mapOrSet : setToMap(mapOrSet);
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
