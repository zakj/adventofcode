import { example, load, solve } from 'lib/advent';
import { Dir, move, Point, PointMap } from 'lib/coords';
import { md5 } from 'lib/util';

type Move = 'U' | 'D' | 'L' | 'R';

const GRID_SIZE = 4;
const MOVES: Record<Move, Dir> = {
  U: Dir.Up,
  D: Dir.Down,
  L: Dir.Left,
  R: Dir.Right,
};

function moves(passcode: string, path: string): Move[] {
  return [...md5(passcode + path).slice(0, 4)]
    .map((c, i) => ('bcdef'.includes(c) ? ('UDLR'[i] as Move) : null))
    .filter(Boolean);
}

function inBounds(p: Point): boolean {
  return p.x >= 0 && p.x < GRID_SIZE && p.y >= 0 && p.y < GRID_SIZE;
}

function shortestPath(passcode: string): string {
  const q: { p: Point; path: string }[] = [{ p: { x: 0, y: 0 }, path: '' }];
  while (q.length) {
    const cur = q.shift();
    if (cur.p.x === GRID_SIZE - 1 && cur.p.x === cur.p.y) return cur.path;
    for (const nextMove of moves(passcode, cur.path)) {
      const next = move(cur.p, MOVES[nextMove]);
      if (!inBounds(next)) continue;
      q.push({ p: next, path: cur.path + nextMove });
    }
  }
}

function longestPath(passcode: string): string {
  const goal = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };
  const q: { p: Point; path: string }[] = [{ p: { x: 0, y: 0 }, path: '' }];
  const paths = new PointMap<string>();
  while (q.length) {
    const cur = q.shift();
    const longestSeen = paths.get(cur.p);
    if (longestSeen && longestSeen.length > cur.path.length) continue;
    paths.set(cur.p, cur.path);
    if (cur.p.x === goal.x && cur.p.y === goal.y) continue;
    for (const nextMove of moves(passcode, cur.path)) {
      const next = move(cur.p, MOVES[nextMove]);
      if (!inBounds(next)) continue;
      q.push({ p: next, path: cur.path + nextMove });
    }
  }
  return paths.get(goal);
}

example.equal(shortestPath('ihgpwlah'), 'DDRRRD');
example.equal(shortestPath('kglvqrro'), 'DDUDRLRRUDRD');
example.equal(shortestPath('ulqzkmiv'), 'DRURDRUDDLLDLUURRDULRLDUUDDDRR');
example.equal(longestPath('ihgpwlah').length, 370);
example.equal(longestPath('kglvqrro').length, 492);
example.equal(longestPath('ulqzkmiv').length, 830);

const input = load().raw.trim();
export default solve(
  () => shortestPath(input),
  () => longestPath(input).length
).expect('RLDUDRDDRR', 590);
