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

function totalOrbits(orbitMap: string[]) {
  const directOrbits = defaultDict(() => new Set());
  orbitMap
    .map(x => x.split(')'))
    .forEach(([orbitee, orbiter]) => {
      directOrbits[orbitee].add(orbiter)
    });
  const tree = {};
  Object.entries(directOrbits).forEach(([parent, children]) => {
  })
}

console.log(totalOrbits(TESTDATA), 42);
