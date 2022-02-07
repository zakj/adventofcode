import { load, solve } from 'lib/advent';
import { Counter } from 'lib/collections';
import { range } from 'lib/util';

type Entry = {
  guard: number;
  sleepAt: number;
  wakeAt: number;
};

function parse(lines: string[]): Entry[] {
  let currentGuard: number;
  let lastSleep: number;
  return lines.sort().reduce((log, line) => {
    const words = line.split(' ');
    const minute = Number(words[1].slice(3, 5));
    if (words[2] == 'Guard') currentGuard = Number(words[3].slice(1));
    else if (words[2] === 'falls') lastSleep = minute;
    else if (words[2] === 'wakes') {
      log.push({ guard: currentGuard, sleepAt: lastSleep, wakeAt: minute });
    }
    return log;
  }, []);
}

type X = {
  id: number;
  minutes: number[];
};

function sleepMinutes(logs: Entry[]): X[] {
  const guardIds = new Set<number>();
  logs.forEach((log) => guardIds.add(log.guard));
  return [...guardIds.values()].map((id) => ({
    id,
    minutes: logs
      .filter((log) => log.guard === id)
      .flatMap((log) => range(log.sleepAt, log.wakeAt)),
  }));
}

function strategy1(logs: Entry[]): number {
  const sleepiestGuard = sleepMinutes(logs).reduce((max, cur) =>
    cur.minutes.length > max.minutes.length ? cur : max
  );
  const sleepiestMinute = new Counter(sleepiestGuard.minutes).mostCommon[0][0];
  return sleepiestGuard.id * sleepiestMinute;
}

function strategy2(logs: Entry[]): number {
  const mostAsleepOnSameMinute = sleepMinutes(logs)
    .map(({ id, minutes }) => ({
      id,
      mostCommon: new Counter(minutes).mostCommon[0],
    }))
    .reduce((max, cur) => (cur.mostCommon[1] > max.mostCommon[1] ? cur : max));
  return mostAsleepOnSameMinute.id * mostAsleepOnSameMinute.mostCommon[0];
}

const logs = parse(load().lines);
export default solve(
  () => strategy1(logs),
  () => strategy2(logs)
).expect(35184, 37886);
