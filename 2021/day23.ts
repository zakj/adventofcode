import { answers, example, load } from '../advent';
import { Dir, move, neighbors4, Point, PointMap, PointSet } from '../coords';
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

// const GridType = {
//   Amber: 'A',
//   Bronze: 'B',
//   Copper: 'C',
//   Desert: 'D',
//   Wall: '#',
//   Path: '.',
//   Nothing: ' ',
// } as const;
// type GridType = ValuesOf<typeof GridType>;

// const burrowGrid = parseGrid(load(23).lines, (c) => c as GridType);

function parse2(lines: string[]): { walkable: PointSet; pods: PointMap<Type> } {
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

  // const roomXs = [3, 5, 7, 9];
  // const entrances = new PointSet(roomXs.map((x) => ({ x, y: 1 })));
  // const rooms = new Map<Type, PointSet>(
  //   [Type.Amber, Type.Bronze, Type.Copper, Type.Desert].map((type, i) => [
  //     type,
  //     new PointSet([
  //       { x: roomXs[i], y: 2 },
  //       { x: roomXs[i], y: 3 },
  //     ]),
  //   ])
  // );

  // return { hallways, pods, entrances, rooms };
}

// function isInRoom(x: number, y: number, type: GridType): boolean {
//   const podTypes = [
//     GridType.Amber,
//     GridType.Bronze,
//     GridType.Copper,
//     GridType.Desert,
//   ];
//   return y > 1 && x === [3, 5, 7, 9][podTypes.findIndex((x) => x === type)];
// }

// function isInFinalPosition(
//   x: number,
//   y: number,
//   type: GridType,
//   grid: PointGrid<GridType>
// ): boolean {
//   return (
//     isInRoom(x, y, type) &&
//     grid.ys.filter((yn) => yn > y).every((y) => grid.get(x, y) === type)
//   );
// }

// function organizeMinimumEnergy(grid: PointGrid<GridType>): number {
//   const room = (x: number) =>
//     new PointSet(grid.ys.filter((y) => y > 1).map((y) => ({ x, y })));
//   const destinationRooms = new Map<GridType, PointSet>([
//     [GridType.Amber, room(3)],
//     [GridType.Bronze, room(5)],
//     [GridType.Copper, room(7)],
//     [GridType.Desert, room(9)],
//   ]);
//   const energyToGrid = new XMap<PointGrid<GridType>, number>(JSON.stringify);
//   energyToGrid.set(grid, 0);
//   let minEnergy = Infinity;

//   const q: PointGrid<GridType>[] = [grid];
//   while (q.length) {
//     const grid = q.pop();
//     for (const x of grid.xs) {
//       for (const y of grid.ys) {
//         const type = grid.get(x, y);
//         if (!['A', 'B', 'C', 'D'].includes(type)) continue;
//         if (isInFinalPosition(x, y, type, grid)) continue;
//         const room = destinationRooms.get(type);
//         // for (const point of room) {
//         //   if (grid.get(point) !== type) false;

//         // }
//         // // from the bottom up, must be pod of correct type or empty. at first
//         // // empty, must only be empty
//         // if ([...room].every)
//       }
//     }
//   }
//   return 0;
// }

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

// ---------------------------

function parse(lines: string[]) {
  const hallways = new PointSet();
  const pods = new PointMap<Type>();

  lines.forEach((line, y) =>
    line.split('').forEach((c, x) => {
      if (y === 1 && c !== '#') hallways.add({ x, y });
      if (isType(c)) pods.set({ x, y }, c);
    })
  );

  const roomXs = [3, 5, 7, 9];
  const entrances = new PointSet(roomXs.map((x) => ({ x, y: 1 })));
  const rooms = new Map<Type, PointSet>(
    [Type.Amber, Type.Bronze, Type.Copper, Type.Desert].map((type, i) => [
      type,
      new PointSet([
        { x: roomXs[i], y: 2 },
        { x: roomXs[i], y: 3 },
      ]),
    ])
  );

  return { hallways, pods, entrances, rooms };
}

function findStepsTo(
  from: Point,
  to: Point,
  walkable: PointSet,
  obstacles: PointSet
): number {
  const visited = new PointSet([from]);
  let cur = from;
  let steps = 0;
  const distance = (a: Point, b: Point): number =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  while (true) {
    if (cur.x === to.x && cur.y === to.y) return steps;
    // Assume simple maze; always move towards the destination.
    cur = neighbors4(cur)
      .filter((p) => walkable.has(p) && !obstacles.has(p) && !visited.has(p))
      .sort((a, b) => distance(b, to) - distance(a, to))
      .pop();
    if (!cur) return -1;
    visited.add(cur);
    steps++;
  }
}

type State = {
  pods: PointMap<Type>;
  rooms: Map<Type, PointSet>;
  energy: number;
};

function stringifyState({ pods, rooms, energy }: State): string {
  return pods
    .entries()
    .map(([p, type]) => `${p.x},${p.y}:${type}`)
    .sort()
    .join(' ');
}

function organizeMinimumEnergy({
  walkable,
  pods,
}: ReturnType<typeof parse2>): number {
  const roomXs = [3, 5, 7, 9];
  const maxY = Math.max(...[...walkable].map(({ y }) => y));
  const entrances = new PointSet(roomXs.map((x) => ({ x, y: 1 })));
  const rooms = new Map<Type, Point[]>(
    [Type.Amber, Type.Bronze, Type.Copper, Type.Desert].map((type, i) => [
      type,
      // new PointSet(range(2, maxY + 1).map(y => ({ x: roomXs[i], y})))
      range(2, maxY + 1)
        .map((y) => ({ x: roomXs[i], y }))
        .sort((a, b) => b.y - a.y),
    ])
  );
  const allPaths = findAllPaths(walkable);
  const hallwayDestinations = [...walkable].filter(
    (p) => p.y === 1 && !entrances.has(p)
  );

  // Clear out any pods that are already in the right place.
  const done = new PointSet();
  for (const [point, type] of pods) {
    const room = rooms.get(type);
    if (!room.some((p) => p.x === point.x && p.y === point.y)) continue; // XXX
    if ([...room].some((p) => p.y > point.y && pods.get(p) !== type)) continue;
    // pods.delete(point);
    done.add(point);
  }

  // Sum cost to move just into the target room for each remaining pod.
  function cost({ pods, energy }: State): number {
    return (
      energy +
      sum(
        [...pods].map(([point, type]) => {
          const target = { x: [...rooms.get(type)][0].x, y: 2 };
          if (point.x === target.x && point.y === target.y) return 0;
          return allPaths.get(point).get(target).size * energyCost[type];
        })
      )
    );
  }

  const energyToState = new Map<string, number>();
  function maybeEnqueue(
    pods: PointMap<Type>,
    done: PointSet,
    energy: number
  ): void {
    const state = { pods, done, rooms: new Map(), energy }; // XXX only need pods
    const key = stringifyState(state);
    if (!energyToState.has(key) || energyToState.get(key) > energy) {
      energyToState.set(key, energy);
      q.add(state);
    }
  }

  type State = {
    pods: PointMap<Type>;
    energy: number;
  };

  const q = new PriorityQueue<State & { done: PointSet }>(cost);
  q.add({ pods, done, energy: 0 });
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

    // XXX once I put a pod in place, I need to update rooms. or leave
    // pods in place or track that they're emplaced or something
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
        newPods.set(destination, type); // XXX don't love this
        const newDone = new PointSet(done);
        newDone.add(destination);
        maybeEnqueue(
          newPods,
          newDone,
          energy + destinationPath.size * energyCost[type]
        );
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
          maybeEnqueue(newPods, done, energy + path.size * energyCost[type]);
        }
      }
    }
  }

  throw 'failed to organize';
}

function minimumEnergy({
  hallways,
  entrances,
  pods,
  rooms,
}: ReturnType<typeof parse>): number {
  let minEnergy = Infinity;
  const nonEntranceHallways = [...hallways].filter((p) => !entrances.has(p));

  // Clear out any pods that are already in the right place.
  for (const [point, type] of pods) {
    const room = rooms.get(type);
    if (!room.has(point)) continue;
    const down = move(point, Dir.Down);
    if (room.has(down) && pods.get(down) !== type) continue;
    room.delete(point);
    pods.delete(point);
  }

  const q: State[] = [{ pods, rooms, energy: 0 }];
  const energyToState = new Map<string, number>([[stringifyState(q[0]), 0]]);
  while (q.length) {
    const { pods, rooms, energy } = q.pop();
    if (pods.size === 0) {
      minEnergy = Math.min(minEnergy, energy);
      continue;
    }

    for (const [point, type] of pods) {
      const destRoom = rooms.get(type);
      const walkable = new PointSet([
        ...hallways,
        ...destRoom,
        move(point, Dir.Up).y === 2 ? move(point, Dir.Up) : point, // XXX ugh, to get out of current room
      ]);
      const obstacles = new PointSet(pods.keys());

      // Can always move to our destination room. Avoid moving to the top space
      // of a room unless the bottom is filled with the correct type.
      const destination = [...destRoom].find(
        (p) => !pods.has(p) && !destRoom.has(move(p, Dir.Down))
      );

      // From a room, we can move to the hallway, but can't end on an entrance.
      let candidates: Point[] = [];
      if (!hallways.has(point)) {
        candidates = nonEntranceHallways.filter((p) => !pods.has(p));
      }

      if (destination) {
        const steps = findStepsTo(point, destination, walkable, obstacles);
        if (steps !== -1) {
          // If we found a path to our destination, this pod is done. Remove
          // from the list of pods and remove the destination room from tracked
          // rooms, to make future checks easier.
          const newPods = new PointMap(pods);
          newPods.delete(point);
          const newRooms = new Map(rooms);
          const newRoom = new PointSet(destRoom);
          newRoom.delete(destination);
          newRooms.set(type, newRoom);
          const state = {
            pods: newPods,
            rooms: newRooms,
            energy: energy + steps * energyCost[type],
          };
          const stateKey = stringifyState(state);
          if (
            !energyToState.has(stateKey) ||
            energyToState.get(stateKey) > energy
          ) {
            energyToState.set(stateKey, state.energy);
            q.push(state);
          }
          // Skip hallway candidates.
          continue;
        }
      }

      for (const dest of candidates) {
        const steps = findStepsTo(point, dest, walkable, obstacles);
        if (steps === -1) continue;
        const newPods = new PointMap(pods);
        newPods.delete(point);
        newPods.set(dest, type);
        const state = {
          pods: newPods,
          rooms,
          energy: energy + steps * energyCost[type],
        };
        const stateKey = stringifyState(state);
        if (
          !energyToState.has(stateKey) ||
          energyToState.get(stateKey) > energy
        ) {
          energyToState.set(stateKey, state.energy);
          q.push(state);
        }
      }
    }
  }
  return minEnergy;
}

const exampleBurrow1 = parse2([
  '#############',
  '#.....D.....#',
  '###.#B#C#D###',
  '  #A#B#C#A#  ',
  '  #########  ',
]);
example.equal(organizeMinimumEnergy(exampleBurrow1), 7008 + 2003);
// const exampleBurrow1 = parse2([
//   '#############',
//   '#.....D.D.A.#',
//   '###.#B#C#.###',
//   '  #A#B#C#.#  ',
//   '  #########  ',
// ]);
// example.equal(organizeMinimumEnergy(exampleBurrow1), 7008);

// const exampleBurrow2 = parse(
//   `#############
// #...........#
// ###B#C#B#D###
//   #A#D#C#A#
//   #########`.split('\n')
// );
// example.equal(minimumEnergy(exampleBurrow2), 12521);

const burrow = parse(load(23).lines);
const burrow2 = parse2(load(23).lines);
answers.expect(16506, 48304);
answers(
  () => organizeMinimumEnergy(burrow2),
  () => {
    const lines = load(23).lines;
    lines.splice(3, 0, '  #D#C#B#A#', '  #D#B#A#C#');
    return organizeMinimumEnergy(parse2(lines));
  }
);
