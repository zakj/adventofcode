import { example, load, solve } from 'lib/advent';
import { Dir, move, Point, PointMap } from 'lib/coords';
import { iter } from 'lib/iter';

function parse(lines: string[]) {
  return lines.map((line) => {
    return line.split(' -> ').map((s) => {
      const [x, y] = s.split(',').map(Number);
      return { x, y };
    });
  });
}

function buildMap(segments: Point[][]) {
  const map = new PointMap<string>();
  for (const points of segments) {
    const cur = points[0];
    map.set(cur, '#');
    for (const point of points.slice(1)) {
      if (cur.x === point.x) {
        while (cur.y !== point.y) {
          cur.y += Math.sign(point.y - cur.y);
          map.set(cur, '#');
        }
      } else {
        while (cur.x !== point.x) {
          cur.x += Math.sign(point.x - cur.x);
          map.set(cur, '#');
        }
      }
    }
  }
  return map;
}

function restingSand(map: PointMap<string>): number {
  const sandEmitter = { x: 500, y: 0 };
  const bottom = iter(map.keys())
    .map((p) => p.y)
    .max();
  for (;;) {
    let sand = move(sandEmitter, Dir.Down);

    for (;;) {
      const down = move(sand, Dir.Down);
      const downLeft = move(down, Dir.Left);
      const downRight = move(down, Dir.Right);

      if (down.y > bottom) {
        return map.values().filter((v) => v === 'o').length;
      } else if (!map.has(down)) {
        sand = down;
        continue;
      } else if (!map.has(downLeft)) {
        sand = downLeft;
        continue;
      } else if (!map.has(downRight)) {
        sand = downRight;
        continue;
      } else {
        map.set(sand, 'o');
        break;
      }
    }
  }
  return 0;
}

function restingSand2(map: PointMap<string>): number {
  const sandEmitter = { x: 500, y: 0 };
  const bottom =
    iter(map.keys())
      .map((p) => p.y)
      .max() + 2;

  const mapHas = (p: Point): boolean => p.y === bottom || map.has(p);

  for (;;) {
    if (map.has(sandEmitter)) {
      return map.values().filter((v) => v === 'o').length;
    }
    let sand = sandEmitter;

    for (;;) {
      const down = move(sand, Dir.Down);
      const downLeft = move(down, Dir.Left);
      const downRight = move(down, Dir.Right);

      if (!mapHas(down)) {
        sand = down;
        continue;
      } else if (!mapHas(downLeft)) {
        sand = downLeft;
        continue;
      } else if (!mapHas(downRight)) {
        sand = downRight;
        continue;
      } else {
        map.set(sand, 'o');
        break;
      }
    }
  }
  return 0;
}

const exampleData = [
  '498,4 -> 498,6 -> 496,6',
  '503,4 -> 502,4 -> 502,9 -> 494,9',
];
example.equal(24, restingSand(buildMap(parse(exampleData))));
example.equal(93, restingSand2(buildMap(parse(exampleData))));

const data = parse(load().lines);
export default solve(
  () => restingSand(buildMap(data)),
  () => restingSand2(buildMap(parse(load().lines)))
).expect(979, 29044);
