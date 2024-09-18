import { main } from 'lib/advent';
import { lines, product, sum } from 'lib/util';

type Resource = 'ore' | 'clay' | 'obsidian' | 'geode';
type Blueprint = {
  id: number;
} & Record<Resource, Vector4>;

type Vector4 = [number, number, number, number];
const vec = {
  add(a: Vector4, b: Vector4): Vector4 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
  },
  sub(a: Vector4, b: Vector4): Vector4 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
  },
};

function parse(lines: string[]): Blueprint[] {
  return lines.map((line) => {
    const [id, ore, clay, obsidianOre, obsidianClay, geodeOre, geodeObsidian] =
      line.match(/\d+/g).map(Number);
    return {
      id,
      ore: [ore, 0, 0, 0],
      clay: [clay, 0, 0, 0],
      obsidian: [obsidianOre, obsidianClay, 0, 0],
      geode: [geodeOre, 0, geodeObsidian, 0],
    };
  });
}

const RESOURCE = {
  ore: 0,
  clay: 1,
  obsidian: 2,
  geode: 3,
};

function neighbors(
  blueprint: Blueprint,
  storage: Vector4
): [Resource, Vector4][] {
  const rv: [Resource, Vector4][] = [];
  for (const type of ['geode', 'obsidian', 'clay', 'ore'] as Resource[]) {
    const cost = blueprint[type];
    if (vec.sub(storage, cost).every((v) => v >= 0)) rv.push([type, cost]);
  }
  return rv;
}

function maxGeodes(
  blueprint: Blueprint,
  minutes: number,
  maxQueue = 1000
): number {
  type QueueItem = { robots: Vector4; storage: Vector4 };

  function score({ robots, storage }: QueueItem, i: number): number {
    return (
      storage[RESOURCE['geode']] * (minutes - i) * 10000 +
      robots[RESOURCE['obsidian']] * 1000 +
      robots[RESOURCE['clay']] * 100 +
      robots[RESOURCE['ore']]
    );
  }

  const robots: Vector4 = [1, 0, 0, 0];
  const storage: Vector4 = [0, 0, 0, 0];
  let q = [{ robots, storage }];
  for (let i = 0; i < minutes; ++i) {
    if (q.length > maxQueue) {
      q.sort((a, b) => score(b, i) - score(a, i));
      q = q.slice(0, maxQueue);
    }
    const nextq = [];
    while (q.length) {
      const { robots, storage } = q.shift();
      const nextStorage = vec.add(storage, robots);
      const canBuild = neighbors(blueprint, storage);
      for (const [type, cost] of canBuild) {
        const newRobot: Vector4 = [0, 0, 0, 0];
        newRobot[RESOURCE[type]] = 1;
        nextq.push({
          robots: vec.add(robots, newRobot),
          storage: vec.sub(nextStorage, cost),
        });
      }
      nextq.push({ robots, storage: nextStorage }); // build nothing, conserving our resources
    }
    q = nextq;
  }
  return Math.max(...q.map(({ storage }) => storage[RESOURCE['geode']]));
}

// XXX bug somewhere in part 1
main(
  (s) => sum(parse(lines(s)).map((b) => maxGeodes(b, 24) * b.id)),
  (s) =>
    product(
      parse(lines(s))
        .slice(0, 3)
        .map((b) => maxGeodes(b, 32, 2000))
    )
);
