import { answers, load } from '../advent';
import { neighbors4, Point, PointMap, PointSet } from '../coords';
import { combinations, PriorityQueue, range, sum, ValuesOf } from '../util';

const Type = {
  Amber: 'A',
  Bronze: 'B',
  Copper: 'C',
  Desert: 'D',
} as const;
type Type = ValuesOf<typeof Type>;
const isType = (c: string): c is Type =>
  Object.values(Type).includes(c as Type);

const energyCost: Record<Type, number> = {
  [Type.Amber]: 1,
  [Type.Bronze]: 10,
  [Type.Copper]: 100,
  [Type.Desert]: 1000,
};

type State = {
  pods: PointMap<Type>;
  done: PointSet;
  energy: number;
};

type Burrow = { walkable: PointSet; pods: PointMap<Type> };

function parse(lines: string[]): Burrow {
  const walkable = new PointSet();
  const pods = new PointMap<Type>();

  lines.forEach((line, y) =>
    line.split('').forEach((c, x) => {
      if (c === '.') walkable.add({ x, y });
      if (isType(c)) {
        walkable.add({ x, y });
        pods.set({ x, y }, c);
      }
    })
  );

  return { walkable, pods };
}

function findPathBetween(from: Point, to: Point, walkable: PointSet): PointSet {
  const q: [Point, PointSet][] = [[from, new PointSet([from])]];
  while (q.length) {
    const [cur, path] = q.shift();
    const neighbors = neighbors4(cur).filter(
      (p) => walkable.has(p) && !path.has(p)
    );
    for (const next of neighbors4(cur)) {
      if (!walkable.has(next) || path.has(next)) continue;
      if (next.x === to.x && next.y === to.y) {
        path.delete(from);
        return path;
      }
      q.push([next, new PointSet([...path, next])]);
    }
  }
  throw 'no path';
}

type AllPaths = PointMap<PointMap<PointSet>>;
function findAllPaths(walkable: PointSet): AllPaths {
  const allPaths: AllPaths = new PointMap();
  for (const [a, b] of combinations([...walkable])) {
    if (!allPaths.has(a)) allPaths.set(a, new PointMap());
    if (!allPaths.has(b)) allPaths.set(b, new PointMap());
    const path = findPathBetween(a, b, walkable);
    allPaths.get(a).set(b, new PointSet([...path, b]));
    allPaths.get(b).set(a, new PointSet([...path, a]));
  }
  return allPaths;
}

function stringifyState({ pods }: State): string {
  return pods
    .entries()
    .map(([p, type]) => `${p.x},${p.y}:${type}`)
    .sort()
    .join(' ');
}

function organizeMinimumEnergy(burrow: Burrow): number {
  const roomXs = [3, 5, 7, 9];
  const maxY = Math.max(...[...burrow.walkable].map(({ y }) => y));
  const entrances = new PointSet(roomXs.map((x) => ({ x, y: 1 })));
  const rooms = new Map<Type, Point[]>(
    [Type.Amber, Type.Bronze, Type.Copper, Type.Desert].map((type, i) => [
      type,
      range(2, maxY + 1)
        .map((y) => ({ x: roomXs[i], y }))
        .sort((a, b) => b.y - a.y),
    ])
  );
  const allPaths = findAllPaths(burrow.walkable);
  const hallwayDestinations = [...burrow.walkable].filter(
    (p) => p.y === 1 && !entrances.has(p)
  );

  // Clear out any pods that are already in the right place.
  const done = new PointSet();
  for (const [point, type] of burrow.pods) {
    const room = rooms.get(type);
    if (!room.some((p) => p.x === point.x && p.y === point.y)) continue;
    if ([...room].some((p) => p.y > point.y && burrow.pods.get(p) !== type))
      continue;
    done.add(point);
  }

  // Sum cost to move just into the target room for each remaining pod.
  function cost({ pods, done, energy }: State): number {
    return (
      energy +
      sum(
        [...pods].map(([point, type]) => {
          const target = { x: [...rooms.get(type)][0].x, y: 2 };
          return done.has(point)
            ? 0
            : allPaths.get(point).get(target).size * energyCost[type];
        })
      )
    );
  }

  const energyToState = new Map<string, number>();
  function maybeEnqueue(state: State): void {
    const key = stringifyState(state);
    if (!energyToState.has(key) || energyToState.get(key) > state.energy) {
      energyToState.set(key, state.energy);
      q.add(state);
    }
  }

  const q = new PriorityQueue<State>(cost);
  q.add({ pods: burrow.pods, done, energy: 0 });
  while (q.length) {
    const { pods, done, energy } = q.shift();
    if (done.size === pods.size) {
      return energy;
    }
    const destinations = new Map(
      [...rooms].map(([type, points]) => {
        const firstEmpty = points.findIndex((p) => !pods.has(p));
        if (
          firstEmpty !== -1 &&
          points.slice(0, firstEmpty).every((p) => pods.get(p) === type) &&
          points.slice(firstEmpty + 1).every((p) => !pods.has(p))
        )
          return [type, points[firstEmpty]];
        return [type, null];
      })
    );

    for (const [point, type] of pods) {
      if (done.has(point)) continue;
      const paths = allPaths.get(point);

      // Attempt to move to our destination. If we can do so, don't try other
      // moves.
      const destination = destinations.get(type);
      const destinationPath = destination ? paths.get(destination) : null;
      if (
        destinationPath &&
        pods.keys().every((p) => !destinationPath.has(p))
      ) {
        const newPods = new PointMap(pods);
        newPods.delete(point);
        newPods.set(destination, type);
        const newDone = new PointSet(done);
        newDone.add(destination);
        maybeEnqueue({
          pods: newPods,
          done: newDone,
          energy: energy + destinationPath.size * energyCost[type],
        });
      }
      // If our destination is unreachable and we're not in the hallway, attempt
      // to move to the hallway.
      else if (point.y !== 1) {
        for (const dest of hallwayDestinations.filter((p) => !pods.has(p))) {
          const path = paths.get(dest);
          if ([...path].some((p) => pods.has(p))) continue;
          const newPods = new PointMap(pods);
          newPods.delete(point);
          newPods.set(dest, type);
          maybeEnqueue({
            pods: newPods,
            done,
            energy: energy + path.size * energyCost[type],
          });
        }
      }
    }
  }

  throw 'failed to organize';
}

const burrow = parse(load(23).lines);
answers.expect(16506, 48304);
answers(
  () => organizeMinimumEnergy(burrow),
  () => {
    const lines = load(23).lines;
    lines.splice(3, 0, '  #D#C#B#A#', '  #D#B#A#C#');
    return organizeMinimumEnergy(parse(lines));
  }
);
