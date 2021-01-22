import { answers, example, load } from './advent';

type Point = { x: number; y: number };
type PointHash = string;

type Map = {
  start: Point;
  goals: Set<PointHash>;
  walls: Set<PointHash>;
};

function parse(lines: string[]): Map {
  const map: Map = { start: null, goals: new Set(), walls: new Set() };
  lines.forEach((line, row) => {
    line.split('').forEach((c, col) => {
      const point = { x: col, y: row };
      if (c === '0') map.start = point;
      else if (c === '#') map.walls.add(pointHash(point));
      else if (c.match(/\d/)) map.goals.add(pointHash(point));
    });
  });
  return map;
}

const pointHash = (p: Point): PointHash => [p.x, p.y].join(',');
const stateHash = (p: Point, goals: Set<string>): string =>
  JSON.stringify([pointHash(p), [...goals.values()].sort()]);

function neighbors(p: Point, map: Map): Point[] {
  return [-1, 1]
    .flatMap((d) => [
      { x: p.x + d, y: p.y },
      { x: p.x, y: p.y + d },
    ])
    .filter((p) => !map.walls.has(pointHash(p)));
}

function shortestPath(map: Map, returnToStart = false): Point[] {
  const visited = new Set<string>();
  const q = [{ path: [map.start], goals: new Set<PointHash>() }];
  while (q.length) {
    const { path, goals } = q.shift();
    if (
      goals.size === map.goals.size &&
      (!returnToStart ||
        pointHash(path[path.length - 1]) === pointHash(map.start))
    )
      return path;
    for (let point of neighbors(path[path.length - 1], map)) {
      const newPath = path.concat(point);
      const newGoals = new Set(goals);
      if (map.goals.has(pointHash(point))) newGoals.add(pointHash(point));
      if (visited.has(stateHash(point, newGoals))) continue;
      visited.add(stateHash(point, newGoals));
      q.push({ path: newPath, goals: newGoals });
    }
  }
  return [];
}

const exampleMap = parse(load(24, 'ex').lines);
example.equal(shortestPath(exampleMap).length - 1, 14);

const map = parse(load(24).lines);
answers(
  () => shortestPath(map).length - 1,
  () => shortestPath(map, true).length - 1
);
