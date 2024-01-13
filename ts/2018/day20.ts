import { main } from 'lib/advent';
import { Dir, move, Point, PointMap } from 'lib/coords';
import { iter } from 'lib/iter';

type Branch = (Dir | [Branch, Branch])[];
const moves: Record<string, Dir> = {
  N: Dir.Up,
  E: Dir.Right,
  S: Dir.Down,
  W: Dir.Left,
};

function parse(s: string): Branch {
  const items = s.slice(1, s.length - 1).split('');
  let depth = 0;
  const depths = new Map<number, Branch>();
  depths.set(depth, []);
  for (const item of items) {
    if (item === '(') {
      depth++;
      depths.set(depth, []);
    } else if (item === '|') {
      depths.get(depth - 1).push([depths.get(depth), []]);
      depths.set(depth, []);
    } else if (item === ')') {
      const parent = depths.get(depth - 1);
      // TODO ugh
      (parent[parent.length - 1] as [Branch, Branch])[1] = depths.get(depth);
      parent.push(parent.pop());
      depths.delete(depth);
      depth--;
    } else {
      depths.get(depth).push(moves[item]);
    }
  }
  return depths.get(0);
}

function walk(branch: Branch) {
  const stepsToReach = new PointMap<number>();
  const start = { x: 0, y: 0 };
  stepsToReach.set(start, 0);
  const q: [cur: Point, branch: Branch][] = [[start, branch]];

  while (q.length) {
    const [start, branch] = q.shift();
    let cur = start;
    for (const item of branch) {
      if (Array.isArray(item)) {
        q.push([cur, item[0]]);
        q.push([cur, item[1]]);
      } else {
        const steps = stepsToReach.get(cur) + 1;
        cur = move(cur, item);
        if ((stepsToReach.get(cur) || Infinity) > steps) {
          stepsToReach.set(cur, steps);
        }
      }
    }
  }
  return stepsToReach;
}

function maxSteps(stepsToReach: PointMap<number>): number {
  return iter(stepsToReach.values()).max();
}

main(
  (s) => maxSteps(walk(parse(s.trim()))),
  (s) =>
    walk(parse(s.trim()))
      .values()
      .filter((s) => s >= 1000).length
);
