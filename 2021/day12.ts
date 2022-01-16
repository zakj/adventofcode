import { load, solve } from '../advent';

type Caves = Map<string, Set<string>>;

function parse(lines: string[]): Caves {
  const caves = new Map<string, Set<string>>();
  for (const line of lines) {
    const [from, to] = line.split('-', 2);
    if (!caves.has(from)) caves.set(from, new Set());
    if (!caves.has(to)) caves.set(to, new Set());
    caves.get(from).add(to);
    caves.get(to).add(from);
  }
  return caves;
}

function isSmall(cave: string): boolean {
  return cave === cave.toLowerCase();
}

function countPaths(caves: Caves, canVisitTwice: boolean = false): number {
  const q: { cur: string; visited: Set<string>; twice: boolean }[] = [
    { cur: 'start', visited: new Set(), twice: canVisitTwice },
  ];
  let paths = 0;
  while (q.length) {
    const { cur, visited, twice } = q.pop();
    for (const next of caves.get(cur)) {
      if (next === 'start') continue;
      if (next === 'end') {
        paths++;
        continue;
      }
      let nextTwice = twice;
      if (visited.has(next) && isSmall(next)) {
        if (twice) nextTwice = false;
        else continue;
      }
      q.push({
        cur: next,
        visited: new Set([...visited, next]),
        twice: nextTwice,
      });
    }
  }
  return paths;
}

const caves = parse(load().lines);
export default solve(
  () => countPaths(caves),
  () => countPaths(caves, true)
).expect(5157, 144309);
