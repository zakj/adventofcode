import { answers, example, load } from '../advent';

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

function countPaths(caves: Caves): number {
  const q: [string, Set<string>][] = [['start', new Set(['start'])]];
  let paths = 0;
  while (q.length) {
    const [cur, visited] = q.pop();
    for (const next of caves.get(cur)) {
      if (visited.has(next) && isSmall(next)) continue;
      if (next === 'end') {
        paths++;
        continue;
      }
      q.push([next, new Set([...visited, next])]);
    }
  }
  return paths;
}

function countPaths2(caves: Caves): number {
  const q: { cur: string; visited: Set<string>; twice: boolean }[] = [
    { cur: 'start', visited: new Set(), twice: false },
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
        if (!twice) nextTwice = true;
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

const exampleCaves = parse(
  `start-A
start-b
A-c
A-b
b-d
A-end
b-end`.split('\n')
);

console.log(exampleCaves);
example.equal(countPaths(exampleCaves), 10);
example.equal(countPaths2(exampleCaves), 36);

const caves = parse(load(12).lines);
answers.expect(5157);
answers(
  () => countPaths(caves),
  () => countPaths2(caves)
);
