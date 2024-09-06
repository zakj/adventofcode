import { main } from 'lib/advent';
import { Dir, Point, PointSet, move } from 'lib/coords';
import { lines } from 'lib/util';

type Blizzard = [Point, Dir];

function parse(lines: string[]): [PointSet, Blizzard[], Point, Point] {
  const width = lines[0].length;
  const height = lines.length;
  const blizzards: Blizzard[] = [];
  const walkable = new PointSet();
  let start: Point;
  let goal: Point;

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const c = lines[y][x];
      if (c === '#') continue;
      walkable.add({ x, y });
      if (c === '.' && y === 0) start = { x, y };
      else if (c === '.' && y === height - 1) goal = { x, y };
      else if (c === '^') blizzards.push([{ x, y }, Dir.Up]);
      else if (c === '>') blizzards.push([{ x, y }, Dir.Right]);
      else if (c === 'v') blizzards.push([{ x, y }, Dir.Down]);
      else if (c === '<') blizzards.push([{ x, y }, Dir.Left]);
    }
  }
  return [walkable, blizzards, start, goal];
}

const moveOptions: Point[] = [
  { x: 0, y: 0 }, // wait
  { x: 0, y: -1 }, // north
  { x: 1, y: 0 }, // east
  { x: 0, y: 1 }, // south
  { x: -1, y: 0 }, // west
];

function moveBlizzards(
  blizzards: Blizzard[],
  maxX: number,
  maxY: number
): Blizzard[] {
  // NOTE: no blizzards in the input will move onto start/goal, so we don't
  // account for it.
  const next: Blizzard[] = [];
  for (const [p, dir] of blizzards) {
    const np: Point = move(p, dir);
    if (np.x >= maxX + 1) np.x = 1;
    else if (np.x <= 0) np.x = maxX;
    else if (np.y >= maxY + 1) np.y = 1;
    else if (np.y <= 0) np.y = maxY;
    next.push([np, dir]);
  }
  return next;
}

function walk(
  walkable: PointSet,
  blizzards: Blizzard[],
  start: Point,
  goal: Point,
  maxX: number,
  maxY: number,
  t = 0
): [number, Blizzard[]] {
  let queue = new PointSet([start]);
  let currentBlizzards: Blizzard[] = blizzards;
  while (!queue.has(goal)) {
    t += 1;
    currentBlizzards = moveBlizzards(currentBlizzards, maxX, maxY);
    const bz = new PointSet(currentBlizzards.map(([p]) => p));
    queue = new PointSet(
      [...queue]
        .flatMap(({ x, y }) =>
          moveOptions.map(({ x: dx, y: dy }) => ({ x: x + dx, y: y + dy }))
        )
        .filter((p) => walkable.has(p) && !bz.has(p))
    );
  }
  return [t, currentBlizzards];
}

function expedition(
  walkable: PointSet,
  blizzards: Blizzard[],
  start: Point,
  goal: Point,
  getSnacks = false
): number {
  const maxX = goal.x;
  const maxY = goal.y - 1;
  let t: number;
  [t, blizzards] = walk(walkable, blizzards, start, goal, maxX, maxY);
  if (getSnacks) {
    [t, blizzards] = walk(walkable, blizzards, goal, start, maxX, maxY, t);
    [t] = walk(walkable, blizzards, start, goal, maxX, maxY, t);
  }
  return t;
}

main(
  (s) => expedition(...parse(lines(s)), false),
  (s) => expedition(...parse(lines(s)), true)
);
