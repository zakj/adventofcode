import { answers, example, load } from '../advent';
import { Dir, move, neighbors4, Point, PointMap, PointSet } from '../coords';
import { ValuesOf } from '../util';

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
  //   {}
  // ]
  //   [...pods.keys()].map((p) => move(p, Dir.Up)).filter((p) => !pods.has(p))
  // );

  // const roomXs = [...new Set(pods.keys().map(({ x, y }) => x))].sort(
  //   (a, b) => a - b
  // );
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

function parseOrig(lines: string[]) {
  const walkable = new PointSet(
    lines
      .flatMap((line, y) =>
        line.split('').map((c, x) => {
          if (c === '.' || Object.values(Type).includes(c as Type)) {
            return { x, y };
          }
        })
      )
      .filter(Boolean)
  );
  const pods = new PointMap<Type>(
    lines
      .flatMap((line, y) =>
        line.split('').map((c, x) => {
          if (Object.values(Type).includes(c as Type)) {
            return [{ x, y }, c] as [Point, Type];
          }
        })
      )
      .filter(Boolean)
  );
  const rooms = new PointSet(pods.keys());
  const entrances = new PointSet(
    [...rooms].map((p) => move(p, Dir.Up)).filter((p) => !rooms.has(p))
  );
  return { walkable, pods, rooms, entrances };
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
  return [
    pods
      .entries()
      .map(([p, type]) => `${p.x},${p.y}:${type}`)
      .sort()
      .join('/'),
    [...rooms.entries()]
      .map(([type, points]) => `${type}:${points.size}`)
      .sort()
      .join('/'),
  ].join(' ');
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
  console.log(stringifyState({ pods, rooms, energy: 0 }));
  for (const [point, type] of pods) {
    const room = rooms.get(type);
    if (!room.has(point)) continue;
    const down = move(point, Dir.Down);
    if (room.has(down) && pods.get(down) !== type) continue;
    room.delete(point);
    pods.delete(point);
  }
  console.log('starting', stringifyState({ pods, rooms, energy: 0 }));

  const q: State[] = [{ pods, rooms, energy: 0 }];
  const energyToState = new Map<string, number>([[stringifyState(q[0]), 0]]);
  while (q.length) {
    const { pods, rooms, energy } = q.pop();
    if (pods.size === 0) {
      if (energy < minEnergy) console.log('new min', energy);
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

const exampleBurrow1 = parse([
  '#############',
  '#.....D.....#',
  '###.#B#C#D###',
  '  #A#B#C#A#  ',
  '  #########  ',
]);
example.equal(minimumEnergy(exampleBurrow1), 7008 + 2003);

const exampleBurrow2 = parse(
  `#############
#...........#
###B#C#B#D###
  #A#D#C#A#
  #########`.split('\n')
);
example.equal(minimumEnergy(exampleBurrow2), 12521);

const burrow = parse(load(23).lines);
answers.expect(16506);
answers(() => minimumEnergy(burrow));
