import { main } from 'lib/advent';
import { Dir, move, Point, PointSet, turnLeft, turnRight } from 'lib/coords';
import { Iter, iter } from 'lib/iter';
import { range } from 'lib/util';

type Steps = Iter<[(dir: Dir) => Dir, number]>;

function parse(input: string): Steps {
  const turns = {
    R: turnRight,
    L: turnLeft,
  };
  return iter(input.split(', ')).map((s) => [turns[s[0]], Number(s.slice(1))]);
}

function walk(steps: Steps): Iter<Point> {
  return steps.scan(
    (cur, [turn, steps]) => {
      const dir = turn(cur.dir);
      return { dir, ...move(cur, dir, steps) };
    },
    { x: 0, y: 0, dir: Dir.Up as Dir }
  );
}

function distanceToEnd(steps: Steps): number {
  const end = walk(steps).last();
  return Math.abs(end.x) + Math.abs(end.y);
}

function pointsBetween(from: Point, to: Point): Point[] {
  const axis = from.x === to.x ? 'y' : 'x';
  return range(from[axis], to[axis]).map((val) => ({ ...from, [axis]: val }));
}

function distanceToFirstRepeat(steps: Steps): number {
  const visited = new PointSet();
  const repeat = walk(steps)
    .aperture(2)
    .map(([prev, p]) => pointsBetween(prev, p))
    .flat()
    .find((p) => {
      if (visited.has(p)) return true;
      visited.add(p);
    });
  return Math.abs(repeat.x) + Math.abs(repeat.y);
}

main(
  (s) => distanceToEnd(parse(s)),
  (s) => distanceToFirstRepeat(parse(s))
);
