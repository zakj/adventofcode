import { example, load, solve } from 'lib/advent';
import { Queue } from 'lib/collections';
import { iter } from 'lib/iter';
import { ValuesOf, XMap, XSet } from 'lib/util';

type Point3d = {
  x: number;
  y: number;
  z: number;
};

type Rect3d = {
  min: Point3d;
  max: Point3d;
};

const Cell = {
  Droplet: '#',
  Air: '.',
  Steam: '~',
} as const;
type Cell = ValuesOf<typeof Cell>;

type Cave = XMap<Point3d, Cell>;
const hash = (p: Point3d) => `${p.x},${p.y},${p.z}`;

function parse(lines: string[]): Point3d[] {
  return lines.map((line) => {
    const [x, y, z] = line.split(',').map(Number);
    return { x, y, z };
  });
}

function distance(a: Point3d, b: Point3d): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
  );
}

function surfaceArea(droplets: Point3d[]): number {
  let exposedSides = droplets.length * 6;
  for (const a of droplets) {
    for (const b of droplets) {
      if (distance(a, b) === 1) exposedSides--;
    }
  }
  return exposedSides;
}

function isWithin(p: Point3d, box: Rect3d): boolean {
  return ['x', 'y', 'z'].every((x) => p[x] >= box.min[x] && p[x] <= box.max[x]);
}

function neighbors(p: Point3d): Point3d[] {
  return [
    { x: p.x + 1, y: p.y, z: p.z },
    { x: p.x - 1, y: p.y, z: p.z },
    { x: p.x, y: p.y + 1, z: p.z },
    { x: p.x, y: p.y - 1, z: p.z },
    { x: p.x, y: p.y, z: p.z + 1 },
    { x: p.x, y: p.y, z: p.z - 1 },
  ];
}

function areaEnclosed(
  cave: Cave,
  bounds: Rect3d,
  start: Point3d
): [XSet<Point3d>, boolean] {
  const area = new XSet(hash, [start]);
  let isEnclosed = true;

  const q = new Queue([start]);
  while (q.size) {
    const cur = q.shift();
    if (!isWithin(cur, bounds)) {
      isEnclosed = false;
      continue;
    }
    for (const next of neighbors(cur)) {
      if (area.has(next) || cave.has(next)) continue;
      q.add(next);
      area.add(next);
    }
  }

  return [area, isEnclosed];
}

function exteriorSurfaceArea(droplets: Point3d[]): number {
  const cave = new XMap<Point3d, Cell>(
    hash,
    droplets.map((p) => [p, Cell.Droplet])
  );
  const dropIter = iter(droplets);
  const bounds = {
    min: {
      x: dropIter.pluck('x').min(),
      y: dropIter.pluck('y').min(),
      z: dropIter.pluck('z').min(),
    },
    max: {
      x: dropIter.pluck('x').max(),
      y: dropIter.pluck('y').max(),
      z: dropIter.pluck('z').max(),
    },
  };

  for (let x = bounds.min.x; x <= bounds.max.x; ++x) {
    for (let y = bounds.min.y; y <= bounds.max.y; ++y) {
      for (let z = bounds.min.z; z <= bounds.max.z; ++z) {
        if (!cave.has({ x, y, z })) {
          const [area, isEnclosed] = areaEnclosed(cave, bounds, { x, y, z });
          for (const p of area) {
            cave.set(p, isEnclosed ? Cell.Air : Cell.Steam);
          }
        }
      }
    }
  }

  let exposedSides = droplets.length * 6;
  for (const a of droplets) {
    for (const b of neighbors(a)) {
      if (cave.has(b) && cave.get(b) !== Cell.Steam) exposedSides--;
    }
  }
  return exposedSides;
}

const exampleData = parse(load('ex').lines);
example.equal(surfaceArea(exampleData), 64);
example.equal(exteriorSurfaceArea(exampleData), 58);

const data = parse(load().lines);
export default solve(
  () => surfaceArea(data),
  () => exteriorSurfaceArea(data)
).expect(4504, 2556);
