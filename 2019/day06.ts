import { defaultDict, loadDay } from './util';

const data = loadDay(6);

const TESTDATA = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`.split('\n');

// function totalOrbits(orbitMap: string[]) {
//   const directOrbits = defaultDict(() => new Set());
//   orbitMap
//     .map(x => x.split(')'))
//     .forEach(([orbitee, orbiter]) => {
//       directOrbits[orbitee].add(orbiter)
//     });
//   const tree = {};
//   Object.entries(directOrbits).forEach(([parent, children]) => {
//   })
// }

function totalOrbits(orbitMap: string[]) {
  const orbits: {[obj: string]: string} = {};
  orbitMap
    .map(x => x.split(')'))
    .forEach(([orbitee, orbiter]) => {
      orbits[orbiter] = orbitee;
    });
  let count = 0;
  Object.entries(orbits).forEach(([orbiter, orbitee]) => {
    count++;
    while (orbits[orbitee]) {
      orbitee = orbits[orbitee];
      count++
    }
  });
  return count;
}

console.log(totalOrbits(TESTDATA), 42);
console.log(totalOrbits(data));
