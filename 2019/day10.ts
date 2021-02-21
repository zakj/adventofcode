import { answers, load } from '../advent';
import { XMap, XSet } from '../util';

type Point = { x: number; y: number };
const h = ({ x, y }: Point) => `${x},${y}`;

function parse(lines: string[]): XSet<Point> {
  const asteroids = new XSet(h);
  lines.forEach((line, y) => {
    line.split('').forEach((c, x) => {
      if (c === '#') asteroids.add({ x, y });
    });
  });
  return asteroids;
}

function angleBetween(a: Point, b: Point): number {
  const radians = Math.atan2(a.y - b.y, a.x - b.x);
  const degrees = (radians * 180) / Math.PI - 90;
  return (degrees + 360) % 360;
}

function monitoringStation(
  asteroids: XSet<Point>
): { station: Point; angles: Map<number, Point[]> } {
  const anglesTo = new XMap<Point, Map<number, Point[]>>(h);
  for (const asteroid of asteroids) {
    const angles = new Map<number, Point[]>();
    for (const other of asteroids) {
      if (asteroid === other) continue;
      const angle = angleBetween(asteroid, other);
      if (!angles.has(angle)) angles.set(angle, []);
      angles.get(angle).push(other);
    }
    anglesTo.set(asteroid, angles);
  }
  const station = anglesTo
    .entries()
    .reduce((max, p) => (p[1].size > max[1].size ? p : max));
  return { station: station[0], angles: station[1] };
}

function distance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

const asteroids = parse(load(10).lines);
answers.expect(347, 829);
answers(
  () => monitoringStation(asteroids).angles.size,
  () => {
    const { station, angles } = monitoringStation(asteroids);
    angles.forEach((asteroids) =>
      asteroids.sort((a, b) => distance(station, a) - distance(station, b))
    );
    const list = [...angles.keys()].sort((a, b) => a - b);
    let i = 0;
    let count = 0;
    let destroyed: Point;
    for (let i = 0; count < 200; ++i) {
      const angle = list[i % list.length];
      destroyed = angles.get(angle).pop();
      if (destroyed !== undefined) ++count;
    }
    return destroyed.x * 100 + destroyed.y;
  }
);
