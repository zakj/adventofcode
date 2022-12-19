import { example, load, solve } from 'lib/advent';
import { Queue } from 'lib/collections';
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
  Enclosed: 'E',
  Empty: '.',
} as const;
type Cell = ValuesOf<typeof Cell>;

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
  let exposedSides = 0;
  for (const a of droplets) {
    let aExposedSides = 6;
    for (const b of droplets) {
      if (a !== b && distance(a, b) === 1) aExposedSides--;
    }
    exposedSides += aExposedSides;
  }
  return exposedSides;
}

type Cave = XMap<Point3d, Cell>;
const hash = (p: Point3d) => `${p.x},${p.y},${p.z}`;

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
    if (
      cur.x < bounds.min.x ||
      cur.x > bounds.max.x ||
      cur.y < bounds.min.y ||
      cur.y > bounds.max.y ||
      cur.z < bounds.min.z ||
      cur.z > bounds.max.z
    ) {
      isEnclosed = false;
      continue;
    }
    const openNeighbors = [
      { ...cur, x: cur.x + 1 },
      { ...cur, x: cur.x - 1 },
      { ...cur, y: cur.y + 1 },
      { ...cur, y: cur.y - 1 },
      { ...cur, z: cur.z + 1 },
      { ...cur, z: cur.z - 1 },
    ].filter((p) => !cave.has(p));
    for (const next of openNeighbors) {
      if (area.has(next)) continue;
      q.add(next);
      area.add(next);
    }
  }

  return [area, isEnclosed];
}

function exteriorSurfaceArea(droplets: Point3d[]): number {
  const cave = new XMap<Point3d, Cell>(hash);
  const bounds: Rect3d = { min: { ...droplets[0] }, max: { ...droplets[0] } };
  droplets.forEach((p) => {
    bounds.min.x = Math.min(bounds.min.x, p.x);
    bounds.min.y = Math.min(bounds.min.y, p.y);
    bounds.min.z = Math.min(bounds.min.z, p.z);
    bounds.max.x = Math.max(bounds.max.x, p.x);
    bounds.max.y = Math.max(bounds.max.y, p.y);
    bounds.max.z = Math.max(bounds.max.z, p.z);
    cave.set(p, Cell.Droplet);
  });

  for (let x = bounds.min.x; x <= bounds.max.x; ++x) {
    for (let y = bounds.min.y; y <= bounds.max.y; ++y) {
      for (let z = bounds.min.z; z <= bounds.max.z; ++z) {
        if (!cave.has({ x, y, z })) {
          const [area, isEnclosed] = areaEnclosed(cave, bounds, { x, y, z });
          for (const p of area) {
            cave.set(p, isEnclosed ? Cell.Enclosed : Cell.Empty);
          }
        }
      }
    }
  }

  let exposedSides = 0;
  for (const a of droplets) {
    let aExposedSides = 6;
    for (const [b] of [...cave].filter(([, type]) => type !== Cell.Empty)) {
      if (distance(a, b) === 1) aExposedSides--;
    }
    exposedSides += aExposedSides;
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
