const { loadDay, mostCommon } = require('./util');

const input = loadDay(4).sort().map(x => {
  const pieces = x.split(' ');
  const log = {time: Number(pieces[1].slice(3, 5))};
  if (pieces[2] === 'Guard') log.begin = Number(pieces[3].slice(1));
  if (pieces[2] === 'falls') log.sleep = true;
  if (pieces[2] === 'wakes') log.wake = true;
  return log;
});

function getSleepMinutes(input) {
  let currentGuard = null;
  let sleepStart = null;
  const obj = input.reduce((acc, log) => {
    if (log.begin) {
      currentGuard = log.begin;
      acc[currentGuard] = acc[currentGuard] || [];
    }
    if (log.sleep) {
      sleepStart = log.time;
    }
    if (log.wake) {
      for (let i = sleepStart; i < log.time; ++i) {
        acc[currentGuard].push(i);
      }
    }
    return acc;
  }, {});
  return Object.entries(obj).map(([id, minutes]) => ({id, minutes}));
}


function part1(input) {
  const sleepMinutes = getSleepMinutes(input);
  const longestSleeper = sleepMinutes.reduce((longest, x) => {
    return x.minutes.length > longest.minutes.length ? x : longest;
  }, sleepMinutes[0]);
  return longestSleeper.id * mostCommon(longestSleeper.minutes).key;
}

function part2(input) {
  const sleepMinutes = getSleepMinutes(input);
  const sleepiestMinute = sleepMinutes
    .map(x => {
      x.mostCommon = mostCommon(x.minutes)
      return x;
    })
    .sort((a, b) => b.mostCommon.count - a.mostCommon.count)[0]
  return Number(sleepiestMinute.id) * Number(sleepiestMinute.mostCommon.key);
}


console.log(part1(input));
console.log(part2(input));
