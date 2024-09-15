import { main } from 'lib/advent';
import { DefaultDict, Queue } from 'lib/collections';
import { iter } from 'lib/iter';
import { combinations, lines } from 'lib/util';

type Valve = { name: string; open: boolean; rate: number; tunnels: string[] };

function parse(data: string): Valve[] {
  return lines(data).map((line) => {
    const [, name, rate, tunnels] =
      /^Valve (..) has flow rate=(\d+).*valves? (.*)$/.exec(line);
    return {
      name,
      open: false,
      rate: Number(rate),
      tunnels: tunnels.split(', '),
    };
  });
}

// https://en.wikipedia.org/wiki/Floyd–Warshall_algorithm
function allShortestPathLengths(
  valveList: Valve[]
): Map<string, DefaultDict<string, number>> {
  const dist = new Map(
    valveList.map((v) => [
      v.name,
      new DefaultDict(
        () => Infinity,
        [[v.name, 0], ...v.tunnels.map((t) => [t, 1] as [string, number])]
      ),
    ])
  );
  for (const k of dist.keys()) {
    for (const i of dist.keys()) {
      for (const j of dist.keys()) {
        const right = dist.get(i).get(k) + dist.get(k).get(j);
        if (dist.get(i).get(j) > right) dist.get(i).set(j, right);
      }
    }
  }
  return dist;
}

function maxPressure(
  valveList: Valve[],
  minutes: number,
  elephant = false
): number {
  const dist = allShortestPathLengths(valveList);
  const usefulValves = valveList.filter((v) => v.rate > 0);
  // use a bitmask instead of a set to make tracking easier
  const mask = Object.fromEntries(
    valveList.map(({ name }, i) => [name, 1 << i])
  );

  // queue is location, time, bitmask of opened valves, total released pressure so far
  type QState = {
    name: string;
    time: number;
    open: number;
    pressure: number;
  };
  const start: QState = {
    name: 'AA',
    time: 0,
    open: 0,
    pressure: 0,
  };
  const q = new Queue([start]);
  const best: Record<number, number> = {}; // open -> pressure

  while (q.size) {
    const { name, time, open, pressure } = q.shift();
    best[open] = Math.max(best[open] ?? 0, pressure);
    for (const next of usefulValves) {
      if (open & mask[next.name]) continue;
      const nextTime = time + dist.get(name).get(next.name) + 1;
      if (nextTime >= minutes) continue;
      q.add({
        name: next.name,
        time: nextTime,
        open: open | mask[next.name],
        pressure: pressure + next.rate * (minutes - nextTime),
      });
    }
  }

  if (!elephant) {
    return iter(Object.values(best)).max();
  } else {
    const possible = [];
    for (const [a, b] of combinations(Object.keys(best))) {
      if (Number(a) & Number(b)) continue;
      possible.push(best[a] + best[b]);
    }
    return iter(possible).max();
  }
}

// XXX examples pass, real data fails
// likely a bug in parsing or shortest path computations?
main(
  (s) => maxPressure(parse(s), 30),
  (s) => maxPressure(parse(s), 26, true)
);
