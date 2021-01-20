import { answers, example } from './advent';
import { md5, sum, zip } from './util';

type Point = [number, number];
type Move = 'U' | 'D' | 'L' | 'R';

const GRID_SIZE = 4;
const DELTAS: Record<Move, Point> = {
  U: [0, -1],
  D: [0, +1],
  L: [-1, 0],
  R: [+1, 0],
};

function moves(passcode: string, p: Point, path: Move[]): Move[] {
  const order = 'UDLR';
  const hash = md5(passcode + path.join('')).slice(0, 4);
  return [...hash]
    .map((c, i) => ('bcdef'.includes(c) ? (order[i] as Move) : null))
    .filter(Boolean);
}

function shortestPath(passcode: string): string {
  const goal = [GRID_SIZE - 1, GRID_SIZE - 1];
  const q: { p: Point; path: Move[] }[] = [{ p: [0, 0] as Point, path: [] }];
  while (q.length) {
    const cur = q.shift();
    if (cur.p[0] === goal[0] && cur.p[1] === goal[1]) return cur.path.join('');
    for (let move of moves(passcode, cur.p, cur.path)) {
      const newPoint = zip(cur.p, DELTAS[move]).map(sum) as Point;
      if (!newPoint.every((x) => x >= 0 && x < GRID_SIZE)) continue;
      q.push({ p: newPoint, path: cur.path.concat(move) });
    }
  }
}

function longestPath(passcode: string): string {
  const goal = [GRID_SIZE - 1, GRID_SIZE - 1];
  const q: { p: Point; path: Move[] }[] = [{ p: [0, 0] as Point, path: [] }];
  const paths = new Map<string, Move[]>();
  while (q.length) {
    const cur = q.shift();
    const key = cur.p.join(',');
    const longestSeen = paths.get(key);
    if (longestSeen && longestSeen.length > cur.path.length) continue;
    paths.set(key, cur.path);
    if (cur.p[0] === goal[0] && cur.p[1] === goal[1]) continue;
    for (let move of moves(passcode, cur.p, cur.path)) {
      const newPoint = zip(cur.p, DELTAS[move]).map(sum) as Point;
      if (!newPoint.every((x) => x >= 0 && x < GRID_SIZE)) continue;
      q.push({ p: newPoint, path: cur.path.concat(move) });
    }
  }
  return paths.get(goal.join(',')).join('');
}

example.equal(shortestPath('ihgpwlah'), 'DDRRRD');
example.equal(shortestPath('kglvqrro'), 'DDUDRLRRUDRD');
example.equal(shortestPath('ulqzkmiv'), 'DRURDRUDDLLDLUURRDULRLDUUDDDRR');
example.equal(longestPath('ihgpwlah').length, 370);
example.equal(longestPath('kglvqrro').length, 492);
example.equal(longestPath('ulqzkmiv').length, 830);

const input = 'mmsxrhfx';
answers(
  () => shortestPath(input),
  () => longestPath(input).length
);
