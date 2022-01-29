import { example, load, solve } from 'lib/advent';
import { sum } from 'lib/util';

function uniqueCharacters(s: string[]): number {
  return new Set(s.join('').replace(/\s+/gm, '')).size;
}

function commonCharacters(group: string[]): number {
  const people = group.map((p) => new Set(p));
  return [...people[0]].reduce((acc, c) => {
    if (people.every((p) => p.has(c))) acc += 1;
    return acc;
  }, 0);
}

const exampleGroups = load('ex').paragraphs;
example.equal(11, sum(exampleGroups.map(uniqueCharacters)));
example.equal(6, sum(exampleGroups.map(commonCharacters)));

const groups = load().paragraphs;
export default solve(
  () => sum(groups.map(uniqueCharacters)),
  () => sum(groups.map(commonCharacters))
).expect(6662, 3382);
