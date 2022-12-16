import { example, load, solve } from 'lib/advent';
import { Point, PointMap, PointSet } from 'lib/coords';
import { last, range } from 'lib/util';

type SB = { sensor: Point; beacon: Point };

function parse(lines: string[]): SB[] {
  return lines.map((line) => {
    const [sx, sy, bx, by] = line
      .match(/x=(-?\d+), y=(-?\d+):.* x=(-?\d+), y=(-?\d+)/)
      .slice(1, 5)
      .map(Number);
    return { sensor: { x: sx, y: sy }, beacon: { x: bx, y: by } };
  });
}

function distance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function part1(data: SB[], target: number) {
  const map = new PointMap<string>();
  const ranges = [];
  const empty = new PointSet();

  for (const { sensor, beacon } of data) {
    map.set(sensor, 'S');
    map.set(beacon, 'B');
  }
  for (const { sensor, beacon } of data) {
    const d = distance(sensor, beacon);
    // console.log({ sensor, beacon, d });
    if (Math.abs(sensor.y - target) > d) continue;
    const top = { x: sensor.x, y: sensor.y - d };
    const right = { x: sensor.x + d, y: sensor.y };
    const bottom = { x: sensor.x, y: sensor.y + d };
    const left = { x: sensor.x - d, y: sensor.y };

    // const len =
    //   target <= sensor.y
    //     ? 2 * (target - top.y) + 1
    //     : 2 * (bottom.y - target) + 1;
    // const startX = sensor.x - Math.floor(len / 2);
    // ranges.push(startX, startX + len);

    for (let y = top.y; y <= bottom.y; ++y) {
      if (y !== target) continue;
      const len = y <= sensor.y ? 2 * (y - top.y) + 1 : 2 * (bottom.y - y) + 1;
      const startX = sensor.x - Math.floor(len / 2);
      ranges.push([startX, startX + len]);
      // console.log({ sensor, beacon, top, bottom, d, len, startX });
      // throw new Error();
      for (let x = startX; x < startX + len; ++x) {
        if (y === target && !map.has({ x, y })) {
          empty.add({ x, y });
          // map.set({ x, y }, '#');
        }
      }
    }
  }

  // console.log(toAscii(map));
  // console.log(empty.size);
  // ####B######################
  // return iter(map.entries()).filter(([p, c]) => p.y === target && c === '#')
  //   .size;
  return empty.size;

  const xs = new Set(ranges.flatMap(([start, end]) => range(start, end + 1)));
  const ff = [...xs].filter((x) => !map.has({ x, y: target }));
  if (ff.length < 100) console.log(ff.sort((a, b) => a - b));
  return ff.length;

  // return iter(map.entries()).filter(([p, c]) => p.y === target && c === '#')
  //   .size;
}

function part2_old(data: SB[], space: number) {
  const map = new PointMap<string>();
  const ranges = [];

  const empty = Array(space + 1)
    .fill(null)
    .map(() => new Set(range(0, space + 1)));

  for (const { sensor, beacon } of data) {
    map.set(sensor, 'S');
    map.set(beacon, 'B');
  }

  for (const { sensor, beacon } of data) {
    const d = distance(sensor, beacon);
    // console.log({ sensor, beacon, d });
    const rangeTop = sensor.y - d;
    const rangeBottom = sensor.y + d;
    // if (!(0 < rangeBottom && space < rangeTop)) continue;
    const top = { x: sensor.x, y: sensor.y - d };
    const right = { x: sensor.x + d, y: sensor.y };
    const bottom = { x: sensor.x, y: sensor.y + d };
    const left = { x: sensor.x - d, y: sensor.y };

    // const len =
    //   target <= sensor.y
    //     ? 2 * (target - top.y) + 1
    //     : 2 * (bottom.y - target) + 1;
    // const startX = sensor.x - Math.floor(len / 2);
    // ranges.push(startX, startX + len);

    for (let y = top.y; y <= bottom.y; ++y) {
      // console.log('checking', y, sensor, d);
      if (!(y in empty)) continue;
      const emptyRow = empty[y];
      // if (y !== target) continue;
      const len = y <= sensor.y ? 2 * (y - top.y) + 1 : 2 * (bottom.y - y) + 1;
      const startX = sensor.x - Math.floor(len / 2);
      // ranges.push([startX, startX + len]);
      // console.log({ sensor, beacon, top, bottom, d, len, startX });
      // throw new Error();
      for (let x = startX; x < startX + len; ++x) {
        // if (x === 14 && y === 11) console.log('WAT');
        // if (y === 10) console.log('  deleting', x);
        // if (x === 25 && y === 10) console.log('WAT');
        emptyRow.delete(x);
        // if (!map.has({ x, y })) {
        //   map.set({ x, y }, '#');
        // }
      }
    }
  }

  // console.log(empty.map((s) => s.size));
  // console.log(toAscii(map));
  // console.log(empty[10]);
  for (let y = 0; y <= space; ++y) {
    if (empty[y].size !== 0) return [...empty[y].values()].pop() * 4000000 + y;
  }
  return 0;

  // console.log(toAscii(map));
  // console.log(empty.size);
  // ####B######################
  // return iter(map.entries()).filter(([p, c]) => p.y === target && c === '#')
  //   .size;
  // return empty.size;

  // const xs = new Set(ranges.flatMap(([start, end]) => range(start, end + 1)));
  // const ff = [...xs].filter((x) => !map.has({ x, y: target }));
  // if (ff.length < 100) console.log(ff.sort((a, b) => a - b));
  // return ff.length;

  // return iter(map.entries()).filter(([p, c]) => p.y === target && c === '#')
  //   .size;
}

function part2(data: SB[], space: number) {
  const map = new PointMap<string>();
  const ranges = [];

  // const empty = Array(space + 1)
  //   .fill(null)
  //   .map(() => new Set(range(0, space + 1)));

  for (const { sensor, beacon } of data) {
    map.set(sensor, 'S');
    map.set(beacon, 'B');
    ranges[sensor.y] ??= [];
    ranges[sensor.y].push([sensor.x, sensor.x]);
    ranges[beacon.y] ??= [];
    ranges[beacon.y].push([beacon.x, beacon.x]);
  }

  for (const { sensor, beacon } of data) {
    const d = distance(sensor, beacon);
    // console.log({ sensor, beacon, d });
    // const rangeTop = sensor.y - d;
    // const rangeBottom = sensor.y + d;
    // if (!(0 < rangeBottom && space < rangeTop)) continue;
    const top = { x: sensor.x, y: sensor.y - d };
    const right = { x: sensor.x + d, y: sensor.y };
    const bottom = { x: sensor.x, y: sensor.y + d };
    const left = { x: sensor.x - d, y: sensor.y };

    // const len =
    //   target <= sensor.y
    //     ? 2 * (target - top.y) + 1
    //     : 2 * (bottom.y - target) + 1;
    // const startX = sensor.x - Math.floor(len / 2);
    // ranges.push(startX, startX + len);

    for (let y = top.y; y <= bottom.y; ++y) {
      // console.log('checking', y, sensor, d);
      if (y < 0 || y > space) continue;
      ranges[y] ??= [];
      // if (y !== target) continue;
      const len = y <= sensor.y ? 2 * (y - top.y) + 1 : 2 * (bottom.y - y) + 1;
      const startX = sensor.x - Math.floor(len / 2);
      ranges[y].push([startX, startX + len - 1]);
      // if (y === 11) console.log(startX, startX + len - 1, sensor, d);
      // ranges.push([startX, startX + len]);
      // console.log({ sensor, beacon, top, bottom, d, len, startX });
      // throw new Error();
      // for (let x = startX; x < startX + len; ++x) {
      // if (x === 14 && y === 11) console.log('WAT');
      // if (y === 10) console.log('  deleting', x);
      // if (x === 25 && y === 10) console.log('WAT');
      // empty[y].delete(x);
      // if (!map.has({ x, y })) {
      //   map.set({ x, y }, '#');
      // }
      // }
    }
  }

  for (let y = 0; y <= space; ++y) {
    const union = unionRanges(ranges[y]);
    if (union.length > 1) {
      const x = union[0][1] + 1;
      return x * 4000000 + y;
    }
    // console.log(y, union);
    // const s = new Set(
    //   ranges[y]
    //     .flatMap(([start, end]) => range(start, end + 1))
    //     .filter((x) => x >= 0 && x <= space)
    // );
    // console.log(y, s.size);
    // if (s.size !== space + 1) {
    //   for (let x = 0; x <= space; ++x) {
    //     if (!s.has(x)) return x * 4000000 + y;
    //   }
    //   console.log(y, s);
    // }
  }

  // console.log(empty.map((s) => s.size));
  // console.log(toAscii(map));
  // console.log(empty[10]);
  // for (let y = 0; y <= space; ++y) {
  //   if (empty[y].size !== 0) return [...empty[y].values()].pop() * 4000000 + y;
  // }
  return 0;

  // console.log(toAscii(map));
  // console.log(empty.size);
  // ####B######################
  // return iter(map.entries()).filter(([p, c]) => p.y === target && c === '#')
  //   .size;
  // return empty.size;

  // const xs = new Set(ranges.flatMap(([start, end]) => range(start, end + 1)));
  // const ff = [...xs].filter((x) => !map.has({ x, y: target }));
  // if (ff.length < 100) console.log(ff.sort((a, b) => a - b));
  // return ff.length;

  // return iter(map.entries()).filter(([p, c]) => p.y === target && c === '#')
  //   .size;
}

const exampleData = parse(load('ex').lines);
example.equal(part1(exampleData, 10), 26);
example.equal(part2(exampleData, 20), 56000011);

function unionRanges(ranges: [number, number][]): [number, number][] {
  const sorted = ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const union = [];
  for (const [start, end] of sorted) {
    if (union.length && last(union)[1] >= start - 1) {
      last(union)[1] = Math.max(last(union)[1], end);
    } else {
      union.push([start, end]);
    }
  }
  return union;
}

const data = parse(load().lines);
export default solve(
  () => part1(data, 2000000),
  () => part2(data, 4000000),
  () => 0
).expect(5461729);
