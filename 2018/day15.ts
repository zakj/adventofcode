import { answers, example, load } from '../advent';
import { sum } from '../util';

type Point = { x: number; y: number };
type PointHash = string;
type Character = {
  type: 'E' | 'G';
  hp: number;
  power: number;
} & Point;
type Characters = Map<PointHash, Character>;
type Walls = Set<PointHash>;
type Maze = { characters: Characters; walls: Walls };
const h = ({ x, y }: Point) => `${x},${y}`;
const DeadElf = Symbol('dead elf');

function parse(lines: string[]): { characters: Characters; walls: Walls } {
  const characters: Characters = new Map();
  const walls: Walls = new Set();
  lines.forEach((line, y) =>
    line.split('').forEach((c, x) => {
      if (c === '#') walls.add(h({ x, y }));
      if (c === 'G' || c === 'E') {
        characters.set(h({ x, y }), { type: c, hp: 200, power: 3, x, y });
      }
    })
  );
  return { characters, walls };
}

function adjacent(p: Point): Point[] {
  return [
    { x: p.x, y: p.y - 1 },
    { x: p.x, y: p.y + 1 },
    { x: p.x - 1, y: p.y },
    { x: p.x + 1, y: p.y },
  ];
}

function readingOrder<T extends Point>(a: T, b: T): number {
  return a.y === b.y ? a.x - b.x : a.y - b.y;
}

// Return best x by key, breaking ties with reading order.
function best<T extends Point>(xs: T[], key: keyof T): T {
  if (xs.length === 0) return null;
  const lowest = xs.reduce((min, x) => (x[key] < min[key] ? x : min))[key];
  return xs.filter((x) => x[key] === lowest).sort(readingOrder)[0];
}

function shortestPathLength(
  from: Point,
  to: Point,
  impassable: Set<PointHash>
): number {
  const target = h(to);
  const visited = new Set<PointHash>();
  const q: { point: Point; steps: number }[] = [{ point: from, steps: 0 }];
  while (q.length) {
    const { point: cur, steps } = q.shift();
    if (h(cur) === target) return steps;
    for (const neighbor of adjacent(cur)) {
      const hash = h(neighbor);
      if (visited.has(hash) || impassable.has(hash)) continue;
      visited.add(hash);
      q.push({ point: neighbor, steps: steps + 1 });
    }
  }
  return -1;
}

function allDistances(
  from: Point,
  impassable: Set<PointHash>
): Map<PointHash, Point & { distance: number }> {
  const q = [from];
  const distances = new Map([[h(from), { ...from, distance: 0 }]]);
  while (q.length) {
    const cur = q.shift();
    const distance = distances.get(h(cur)).distance + 1;
    for (const neighbor of adjacent(cur)) {
      const hash = h(neighbor);
      if (distances.has(hash) || impassable.has(hash)) continue;
      distances.set(hash, { ...neighbor, distance });
      q.push(neighbor);
    }
  }
  return distances;
}

function play(
  { characters, walls }: Maze,
  elfPower?: number
): number | typeof DeadElf {
  let rounds = 0;
  characters = new Map(
    [...characters.entries()].map(([k, v]) => [k, { ...v }])
  );
  while (true) {
    for (const char of [...characters.values()].sort(readingOrder)) {
      if (char.hp <= 0) continue; // catch characters who died mid-round
      const enemies = [...characters.values()].filter(
        (e) => char.type !== e.type
      );
      if (enemies.length === 0) {
        return rounds * sum([...characters.values()].map((c) => c.hp));
      }

      let adjacentPoints = new Set(adjacent(char).map(h));
      let adjacentEnemies = enemies.filter((e) => adjacentPoints.has(h(e)));

      // Move if we can't attack from here.
      if (adjacentEnemies.length === 0) {
        // Find the best reachable enemy-adjacent location, or end our turn.
        const impassable = new Set([...characters.keys(), ...walls]);
        const distances = allDistances(char, impassable);
        const targets = new Set(enemies.flatMap((e) => adjacent(e)).map(h));
        const targetDistances = [...distances]
          .filter(([hash]) => targets.has(hash))
          .map(([hash, pd]) => pd);
        const target = best([...targetDistances.values()], 'distance');
        if (!target) continue;

        // Move to the best next step towards the chosen target.
        const { x, y } = best(
          adjacent(char)
            .filter((p) => !impassable.has(h(p)))
            .map((p) => ({
              ...p,
              distance: shortestPathLength(p, target, impassable),
            }))
            .filter((p) => p.distance !== -1),
          'distance'
        );
        const newChar = { ...char, x, y };
        characters.delete(h(char));
        characters.set(h(newChar), newChar);

        // Adjacent enemies have changed since the move.
        adjacentPoints = new Set(adjacent(newChar).map(h));
        adjacentEnemies = enemies.filter((e) => adjacentPoints.has(h(e)));
      }

      // Attack if we can.
      if (adjacentEnemies.length > 0) {
        const enemy = best(adjacentEnemies, 'hp');
        enemy.hp -= elfPower && char.type === 'E' ? elfPower : char.power;
        if (enemy.hp <= 0) {
          characters.delete(h(enemy));
          if (elfPower && enemy.type === 'E') return DeadElf;
        }
      }
    }
    rounds++;
  }
}

function elfatePower(maze: Maze): number {
  let low = 4;
  let high = 20;
  while (low < high) {
    const elfPower = Math.floor((low + high) / 2);
    if (play(maze, elfPower) !== DeadElf) high = elfPower;
    else low = elfPower + 1;
  }
  return play(maze, low) as number;
}

function debug(characters: Characters, walls: Walls) {
  const size =
    Math.max(...[...walls.keys()].map((s) => Number(s.split(',')[0]))) + 1;
  for (let y = 0; y < size; ++y) {
    const row = [];
    const chars = [];
    for (let x = 0; x < size; ++x) {
      const hash = h({ x, y });
      if (walls.has(hash)) row.push('#');
      else if (characters.has(hash)) {
        const c = characters.get(hash);
        row.push(c.type);
        chars.push(c);
      } else {
        row.push('.');
      }
    }
    console.log(
      row.join(''),
      ' ',
      chars.map((c) => `${c.type}(${c.hp})`).join(', ')
    );
  }
  console.log();
}

const testCases: [number, Maze][] = load(15, 'ex').paragraphs.map((lines) => [
  Number(lines.shift()),
  parse(lines),
]);
for (const [result, exampleMaze] of testCases) {
  example.equal(play(exampleMaze), result);
}

const map = parse(load(15).lines);
answers.expect(206236, 88537);
answers(
  () => play(map),
  () => elfatePower(map)
);
