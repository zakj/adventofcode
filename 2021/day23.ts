import { load, solve } from 'lib/advent';
import { Point, PointMap } from 'lib/coords';
import { minDistance } from 'lib/graph';
import { range, sum, ValuesOf } from 'lib/util';

const Type = {
  Amber: 'A',
  Bronze: 'B',
  Copper: 'C',
  Desert: 'D',
} as const;
type Type = ValuesOf<typeof Type>;
const isType = (c: string): c is Type =>
  Object.values(Type).includes(c as Type);
type Pod = Point & { type: Type };
type Pods = Pod[];

const targetRoom: Record<Type, number> = {
  [Type.Amber]: 3,
  [Type.Bronze]: 5,
  [Type.Copper]: 7,
  [Type.Desert]: 9,
};
const energyCost: Record<Type, number> = {
  [Type.Amber]: 1,
  [Type.Bronze]: 10,
  [Type.Copper]: 100,
  [Type.Desert]: 1000,
};

const HALLWAY_Y = 1;
const HALLWAY = range(1, 12)
  .filter((x) => !Object.values(targetRoom).includes(x))
  .map((x) => ({ x, y: HALLWAY_Y }));
const ROOM_YS = range(HALLWAY_Y + 1, HALLWAY_Y + 1 + 4);

function parse(s: string): Pods {
  const lines = s.trim().split('\n');
  return range(0, lines.length)
    .flatMap((y) =>
      range(0, lines[y].length).map((x) => ({
        x,
        y,
        type: lines[y][x] as Type,
      }))
    )
    .filter((p) => isType(p.type));
}

// Note: only handles moving from a room or a hallway to another room.
function stepsToReach(from: Point, to: Point): number {
  return Math.abs(from.x - to.x) + (to.y - HALLWAY_Y) + (from.y - HALLWAY_Y);
}

function isHallwayClear(from: Point, to: Point, hallwayPods: Pods) {
  const [minX, maxX] = [from.x, to.x].sort((a, b) => a - b);
  return hallwayPods.every((p) => p.x === from.x || p.x < minX || p.x > maxX);
}

function move(pods: Pods, from: Pod, to: Point): [Pods, number] {
  const nextPods = pods.slice();
  nextPods[nextPods.indexOf(from)] = { x: to.x, y: to.y, type: from.type };
  return [nextPods, stepsToReach(from, to) * energyCost[from.type]];
}

function edgeWeights(roomSize: 2 | 4): (pods: Pods) => [Pods, number][] {
  const rooms: [Type, Point[]][] = Object.entries(targetRoom).map(
    ([type, x]) => [
      type as Type,
      ROOM_YS.slice(0, roomSize).map((y) => ({ x, y })),
    ]
  );

  return function edgeWeights(pods: Pods): [Pods, number][] {
    const podMap = new PointMap(pods.map((p) => [{ x: p.x, y: p.y }, p.type]));
    const destinations = new Map<Type, Point>(
      rooms
        .map(([type, room]) => {
          const topPodIdx = room.findIndex((p) => podMap.has(p));
          const emptyIdx = topPodIdx === -1 ? room.length - 1 : topPodIdx - 1;
          return room.slice(emptyIdx + 1).every((p) => podMap.get(p) === type)
            ? ([type, room[emptyIdx]] as [Type, Point])
            : null;
        })
        .filter(Boolean)
    );

    const hallwayPods = pods.filter((p) => p.y === HALLWAY_Y);
    const roomPods = [
      ...pods
        .filter((p) => p.y !== HALLWAY_Y)
        .reduce((rooms, p) => {
          if (!rooms.has(p.x)) rooms.set(p.x, []);
          rooms.get(p.x).push(p);
          return rooms;
        }, new Map<number, Pods>()),
    ]
      .map(([, pods]) => {
        pods.sort((a, b) => a.y - b.y);
        return pods && pods.some((p) => p.x !== targetRoom[p.type])
          ? pods[0]
          : null;
      })
      .filter(Boolean);

    // If we can move a pod to its destination, that is the only edge.
    for (const pod of [...hallwayPods, ...roomPods]) {
      const dest = destinations.get(pod.type);
      if (dest && isHallwayClear(pod, dest, hallwayPods)) {
        return [move(pods, pod, dest)];
      }
    }

    // Otherwise, try moving all pods in rooms to hallways.
    const candidates = [];
    for (const pod of roomPods) {
      for (const dest of HALLWAY) {
        if (!isHallwayClear(pod, dest, hallwayPods)) continue;
        candidates.push(move(pods, pod, dest));
      }
    }
    return candidates;
  };
}

function heuristic(pods: Pods): number {
  const cost = (p: Pod) =>
    stepsToReach(p, { x: targetRoom[p.type], y: 2 }) * energyCost[p.type];
  return sum(pods.filter((p) => p.x !== targetRoom[p.type]).map(cost));
}

function serialize(pods: Pods): string {
  return [...pods]
    .map((pod) => `${pod.x},${pod.y}:${pod.type}`)
    .sort()
    .join(' ');
}

const final1 = parse(`#############
#...........#
###A#B#C#D###
  #A#B#C#D#
  #########`);
const final2 = parse(`#############
#...........#
###A#B#C#D###
  #A#B#C#D#
  #A#B#C#D#
  #A#B#C#D#
  #########`);

const burrow = parse(load().raw);
export default solve(
  () =>
    minDistance(burrow, serialize, {
      goal: final1,
      edgeWeights: edgeWeights(2),
      heuristic,
    }),
  () => {
    const lines = load().lines;
    lines.splice(3, 0, '  #D#C#B#A#', '  #D#B#A#C#');
    const burrow = parse(lines.join('\n'));
    return minDistance(burrow, serialize, {
      goal: final2,
      edgeWeights: edgeWeights(4),
      heuristic,
    });
  }
).expect(16506, 48304);
