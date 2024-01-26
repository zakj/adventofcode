import { main } from 'lib/advent';
import { PointMap, PointSet, distance } from 'lib/coords';
import { iter } from 'lib/iter';
import { lines } from 'lib/util';

type Input = { sensors: PointMap<number>; beacons: PointSet };
type Range = [number, number];
const FREQUENCY_MULTIPLIER = 4000000;

function parse(lines: string[]): Input {
  const pairs = lines.map((line) => {
    const [sx, sy, bx, by] = line.match(/-?\d+/g).slice(0, 4).map(Number);
    return { sensor: { x: sx, y: sy }, beacon: { x: bx, y: by } };
  });
  const sensors = new PointMap(
    pairs.map(({ sensor, beacon }) => [sensor, distance(sensor, beacon)])
  );
  const beacons = new PointSet(pairs.map(({ beacon }) => beacon));
  return { sensors, beacons };
}

function rangeOverlaps(a: Range, b: Range): boolean {
  return a[0] <= b[1] && b[0] <= a[1];
}

function unionRanges(ranges: [number, number][]): [number, number][] {
  const sorted = ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const union = [];
  let last: [number, number];
  for (const [start, end] of sorted) {
    if (last && last[1] >= start - 1) {
      last[1] = Math.max(last[1], end);
    } else {
      last = [start, end];
      union.push(last);
    }
  }
  return union;
}

function noBeaconCount({ sensors, beacons }: Input, targetY: number) {
  const ranges = iter(sensors.entries())
    .filter(([sensor, d]) =>
      rangeOverlaps([sensor.y - d, sensor.y + d], [targetY, targetY])
    )
    .map(([sensor, d]) => {
      const yDistance = d - Math.abs(sensor.y - targetY);
      return [sensor.x - yDistance, sensor.x + yDistance] as Range;
    })
    .toArray();

  const union = unionRanges(ranges);
  const noBeacon = iter(union).map(([start, end]) => end - start + 1);
  const objects = iter([...sensors.keys(), ...beacons])
    .filter(({ y }) => y === targetY)
    .map(({ x }) => x)
    .uniq()
    .filter((x) => union.some((range) => rangeOverlaps(range, [x, x])));
  return noBeacon.sum() - objects.size;
}

// TODO: optimize
function tuningFrequency({ sensors, beacons }: Input, space: number) {
  const ranges = Array(space + 1)
    .fill(null)
    .map(() => []);

  for (const p of [...sensors.keys(), ...beacons]) {
    if (p.y >= 0 && p.y <= space) ranges[p.y].push([p.x, p.x]);
  }

  for (const [sensor, d] of sensors.entries()) {
    const top = sensor.y - d;
    const bottom = sensor.y + d;

    for (let y = Math.max(0, top); y <= Math.min(space, bottom); ++y) {
      const yDistance = d - Math.abs(sensor.y - y);
      ranges[y].push([sensor.x - yDistance, sensor.x + yDistance] as Range);
    }
  }

  for (let y = 0; y <= space; ++y) {
    const union = unionRanges(ranges[y]);
    if (union.length > 1) {
      const x = union[0][1] + 1;
      return x * FREQUENCY_MULTIPLIER + y;
    }
  }
}

main(
  (s, { target_y }) => noBeaconCount(parse(lines(s)), target_y as number),
  (s, { space }) => tuningFrequency(parse(lines(s)), space as number)
);
