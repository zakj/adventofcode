import { example, load, solve } from 'lib/advent';
import { Queue } from 'lib/collections';
import { product, sum } from 'lib/util';

type Resource = 'ore' | 'clay' | 'obsidian' | 'geode';
type Blueprint = {
  id: number;
} & Record<Resource, Partial<Record<Resource, number>>>;

function parse(lines: string[]): Blueprint[] {
  return lines.map((line) => {
    const [id, ore, clay, obsidianOre, obsidianClay, geodeOre, geodeObsidian] =
      line.match(/\d+/g).map(Number);
    return {
      id,
      ore: { ore },
      clay: { ore: clay },
      obsidian: { ore: obsidianOre, clay: obsidianClay },
      geode: { ore: geodeOre, obsidian: geodeObsidian },
    };
  });
}

function neighbors(
  blueprint: ReturnType<typeof parse>[0],
  robots,
  storage
): [Resource, Partial<Record<Resource, number>>][] {
  const rv: [Resource, Partial<Record<Resource, number>>][] = [];
  for (const type of ['geode', 'obsidian', 'clay', 'ore'] as Resource[]) {
    const cost = blueprint[type];
    // console.log('neighbors', storage);
    if (Object.entries(cost).some(([resource, n]) => storage[resource] < n))
      continue;
    rv.push([type, cost]);
    // if (type === 'geode'|| type === 'obsidian') return rv;
    // if (rv.length > 1) return rv;  // XXX maybe naive?
    // // if (type === 'geode') console.log('building geode');
    // const newRobots = JSON.parse(JSON.stringify(robots));
    // const newStorage = JSON.parse(JSON.stringify(storage));
    // newRobots[type]++;
    // // console.log('buildling robot', type);
    // for (const [resource, n] of Object.entries(cost)) {
    //   newStorage[resource] -= n;
    // }
    // if (type === 'obsidian') {
    //   console.log({ robots, newRobots, storage, newStorage, cost });
    //   throw new Error();
    // }
    // rv.push({ robots: newRobots, storage: newStorage });
    // return [{ robots: newRobots, storage: newStorage }];
  }
  // console.log('--neighbots');
  // console.log(rv);
  // console.log('-');
  return rv;
}

function maxGeodes(
  blueprint: ReturnType<typeof parse>['0'],
  minutes: number
): number {
  const robots = { ore: 1, clay: 0, obsidian: 0, geode: 0 };
  const storage = { ore: 0, clay: 0, obsidian: 0, geode: 0 };

  const q = new Queue<{
    robots: Record<Resource, number>;
    storage: Record<Resource, number>;
    i: number;
  }>([{ robots, storage, i: 0 }]);
  let max = 0;
  const bestAt: Record<number, number> = {};

  const maxOreBots = Math.max(
    blueprint.ore.ore ?? 0,
    blueprint.clay.ore ?? 0,
    blueprint.obsidian.ore ?? 0,
    blueprint.geode.ore ?? 0
  );
  const maxClayBots = blueprint.obsidian.clay;
  while (q.size) {
    const { robots, storage, i } = q.shift();
    // console.log('MINUTE', i + 1);
    if (storage.geode < bestAt[i] ?? 0) continue;
    bestAt[i] = storage.geode;
    // console.log({ robots, storage, i });
    const canBuild = neighbors(blueprint, robots, storage);
    // XXX this is wrong! spend ore to build a robot, then collect from existing robots
    for (const [type, n] of Object.entries(robots)) {
      storage[type] += n;
      // console.log('  adding to storage', type, n);
    }
    if (i === minutes - 1) {
      max = Math.max(storage.geode, max);
      continue;
    }

    // console.log('Minute', i + 1, { storage, robots });

    const weight = (robots, storage) =>
      // ((storage.geode + robots.geode * (MINUTES - i)) * 1000 +
      //   robots.obsidian * 100 +
      //   robots.clay * 50 +
      //   robots.ore * 10 +
      //   (storage.ore + storage.clay + storage.obsidian)) *
      (storage.geode +
        robots.geode * (minutes - i) +
        (storage.obsidian + robots.obsidian * (minutes - i)) * 0.8 +
        (storage.clay + robots.clay * (minutes - i)) * 0.5 +
        (storage.ore + robots.ore * (minutes - i)) * 0.2) *
      -1;

    // console.log(weight(robots, storage), { robots, storage });

    for (const [type, cost] of canBuild) {
      // console.log('** adding to queue', {
      //   robots: nextRobots,
      //   storage: nextStorage,
      //   i: i + 1,
      // });
      if (type === 'ore' && robots.ore >= maxOreBots) continue;
      if (type === 'clay' && robots.clay >= maxClayBots) continue;
      const nextRobots = { ...robots, [type]: robots[type] + 1 };
      const nextStorage = { ...storage };
      for (const [resource, n] of Object.entries(cost)) {
        nextStorage[resource] -= n;
      }
      q.add({
        robots: nextRobots,
        storage: nextStorage,
        i: i + 1,
      });
      if (type === 'geode') break;
      if (type === 'obsidian') break;
    }
    // console.log('-- adding no build to queue', { robots, storage, i: i + 1 });
    q.add({ robots, storage, i: i + 1 });
  }
  return max;
}

function part1(blueprints: ReturnType<typeof parse>): number {
  return sum(
    blueprints.map((b) => {
      console.log('checking', b.id);
      return maxGeodes(b, 24) * b.id;
    })
  );
}

function part2(blueprints: ReturnType<typeof parse>): number {
  return product(
    blueprints.slice(0, 3).map((b) => {
      console.log('checking', b.id);
      const val = maxGeodes(b, 32);
      console.log('==', val);
      return val;
    })
  );
}
const exampleData = parse([
  'Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.',
  'Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.',
]);
// example.equal(maxGeodes(exampleData[0]), 9);
// example.equal(maxGeodes(exampleData[1]), 12);
example.equal(part1(exampleData), 33);
example.equal(part2(exampleData), 62 * 56);

const data = parse(load().lines);
export default solve(
  () => 'done with examples',
  // () => part1(data),
  () => part2(data),
  () => 0,
  () => 0
).expect(1192, 14725);
