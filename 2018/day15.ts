import { answers, example, load } from '../advent';
import { findBounds, neighbors4, Point, PointMap, PointSet } from '../coords';
import { sum } from '../util';

type Character = {
  type: 'E' | 'G';
  hp: number;
  power: number;
} & Point;
type Characters = PointMap<Character>;
type Walls = PointSet;
type Maze = { characters: Characters; walls: Walls };
const DeadElf = Symbol('dead elf');

function parse(lines: string[]): { characters: Characters; walls: Walls } {
  const characters: Characters = new PointMap();
  const walls: Walls = new PointSet();
  lines.forEach((line, y) =>
    line.split('').forEach((c, x) => {
      if (c === '#') walls.add({ x, y });
      if (c === 'G' || c === 'E') {
        characters.set({ x, y }, { type: c, hp: 200, power: 3, x, y });
      }
    })
  );
  return { characters, walls };
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
  impassable: PointSet
): number {
  const visited = new PointSet();
  const q: { point: Point; steps: number }[] = [{ point: from, steps: 0 }];
  while (q.length) {
    const { point: cur, steps } = q.shift();
    if (cur.x === to.x && cur.y === to.y) return steps;
    for (const neighbor of neighbors4(cur)) {
      if (visited.has(neighbor) || impassable.has(neighbor)) continue;
      visited.add(neighbor);
      q.push({ point: neighbor, steps: steps + 1 });
    }
  }
  return -1;
}

function allDistances(
  from: Point,
  impassable: PointSet
): PointMap<Point & { distance: number }> {
  const q = [from];
  const distances = new PointMap([[from, { ...from, distance: 0 }]]);
  while (q.length) {
    const cur = q.shift();
    const distance = distances.get(cur).distance + 1;
    for (const neighbor of neighbors4(cur)) {
      if (distances.has(neighbor) || impassable.has(neighbor)) continue;
      distances.set(neighbor, { ...neighbor, distance });
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
  characters = new PointMap(
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

      let adjacentPoints = new PointSet(neighbors4(char));
      let adjacentEnemies = enemies.filter((e) => adjacentPoints.has(e));

      // Move if we can't attack from here.
      if (adjacentEnemies.length === 0) {
        // Find the best reachable enemy-adjacent location, or end our turn.
        const impassable = new PointSet([...characters.keys(), ...walls]);
        const distances = allDistances(char, impassable);
        const targets = new PointSet(enemies.flatMap((e) => neighbors4(e)));
        const targetDistances = [...distances]
          .filter(([hash]) => targets.has(hash))
          .map(([hash, pd]) => pd);
        const target = best([...targetDistances.values()], 'distance');
        if (!target) continue;

        // Move to the best next step towards the chosen target.
        const { x, y } = best(
          neighbors4(char)
            .filter((p) => !impassable.has(p))
            .map((p) => ({
              ...p,
              distance: shortestPathLength(p, target, impassable),
            }))
            .filter((p) => p.distance !== -1),
          'distance'
        );
        const newChar = { ...char, x, y };
        characters.delete(char);
        characters.set(newChar, newChar);

        // Adjacent enemies have changed since the move.
        adjacentPoints = new PointSet(neighbors4(newChar));
        adjacentEnemies = enemies.filter((e) => adjacentPoints.has(e));
      }

      // Attack if we can.
      if (adjacentEnemies.length > 0) {
        const enemy = best(adjacentEnemies, 'hp');
        enemy.hp -= elfPower && char.type === 'E' ? elfPower : char.power;
        if (enemy.hp <= 0) {
          characters.delete(enemy);
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
  const bounds = findBounds(walls);
  for (let y = 0; y <= bounds.max.y; ++y) {
    const row = [];
    const chars = [];
    for (let x = 0; x < bounds.max.x; ++x) {
      const p = { x, y };
      if (walls.has(p)) row.push('#');
      else if (characters.has(p)) {
        const c = characters.get(p);
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
