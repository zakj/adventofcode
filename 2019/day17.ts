import { load, solve } from '../advent';
import {
  Dir,
  move,
  neighbors4,
  parseMap,
  Point,
  PointSet,
  turnLeft,
  turnRight,
} from '../coords';
import { chunks, sum } from '../util';
import { compile, parse } from './intcode';

let robotDirs: Map<string, Dir> = new Map([
  ['^', Dir.Up],
  ['>', Dir.Right],
  ['v', Dir.Down],
  ['<', Dir.Left],
]);

type RobotOutput = {
  start: Point;
  dir: Dir;
  finish: Point;
  walkable: PointSet;
};

function parseRobot(s: string): RobotOutput {
  const map = parseMap(s.trim().split('\n'), (c) => c);
  const startCell: [Point, string] = [...map].find(([p, c]) =>
    ['^', '>', 'v', '<'].includes(c)
  );
  const [start, dir] = [startCell[0], robotDirs.get(startCell[1])];
  const walkable = new PointSet(
    [...map].filter(([p, c]) => c === '#').map(([p]) => p)
  );
  const finish = [...walkable].find(
    (p) => neighbors4(p).filter((n) => walkable.has(n)).length === 1
  );
  return { start, dir, finish, walkable };
}

function alignmentParameters({ walkable }: { walkable: PointSet }): number {
  return sum(
    [...walkable].map((p) =>
      neighbors4(p).every((n) => walkable.has(n)) ? p.x * p.y : 0
    )
  );
}

function findPath({ start, dir, finish, walkable }: RobotOutput): string[] {
  let cur = start;
  const path = [];
  while (cur.x !== finish.x || cur.y !== finish.y) {
    let next: Point;
    let forward = 0;
    while (walkable.has((next = move(cur, dir)))) {
      forward++;
      cur = next;
    }

    if (forward) {
      path.push(forward);
    } else {
      const left = turnLeft(dir);
      if (walkable.has(move(cur, left))) {
        path.push('L');
        dir = left;
      } else {
        path.push('R');
        dir = turnRight(dir);
      }
    }
  }
  return path;
}

// TODO this is such a hack
function compress(path: string[]): {
  main: string;
  A: string;
  B: string;
  C: string;
} {
  // Each subroutine should start with a turn and end with a move, so we can
  // split into pairs.
  const pairs = chunks(path, 2).map((x) => x.join(','));
  // Replace pairs with single characters for ease of comparison later.
  const replacements = 'TUVWXYZ';
  const map = new Map<string, string>();
  let i = 0;
  for (const pair of pairs) {
    if (map.has(pair)) continue;
    map.set(pair, replacements[i++]);
  }

  const replaced = pairs.map((p) => map.get(p)).join('');
  let A: string;
  let B: string;
  let C: string;
  outer: for (let aLen = 2; aLen < 7; ++aLen) {
    A = replaced.slice(0, aLen + 1);
    for (let cLen = 2; cLen < 7; ++cLen) {
      C = replaced.slice(-cLen);
      const fragments = replaced.split(A).join('').split(C).filter(Boolean);
      if (fragments.length === 1) continue;
      // TODO: Fails if the shortest fragment is always duplicated.
      B = fragments.reduce((min, f) => (f.length < min.length ? f : min));
      if (fragments.some((f) => f.replaceAll(B, '').length)) continue;
      // Otherwise we have a working set of subroutines.
      break outer;
    }
  }

  const revmap = new Map([...map].map(([k, v]) => [v, k]));
  const toSub = (s: string): string =>
    s
      .split('')
      .map((c) => revmap.get(c))
      .join(',');
  A = toSub(A);
  B = toSub(B);
  C = toSub(C);
  return {
    main: path
      .join(',')
      .replaceAll(A, 'A')
      .replaceAll(B, 'B')
      .replaceAll(C, 'C'),
    A,
    B,
    C,
  };
}

const program = parse(load().raw);
export default solve(
  () => {
    const robot = compile(program);
    const { walkable } = parseRobot(robot.ascii());
    return alignmentParameters({ walkable });
  },
  () => {
    const robot = compile(program);
    robot.memory.set(0, 2);
    const path = findPath(parseRobot(robot.ascii()));
    const routines = compress(path);
    return robot(
      routines.main,
      routines.A,
      routines.B,
      routines.C,
      'n' // continuous?
    ).pop();
  }
).expect(2804, 833429);
