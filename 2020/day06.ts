import { example, loadDay, sum } from './util';

const exampleGroups = `
abc

a
b
c

ab
ac

a
a
a
a

b
`.trim().split('\n\n');

example.equal(11, sum(exampleGroups.map(uniqueCharacters)))
example.equal(6, sum(exampleGroups.map(commonCharacters)))

function uniqueCharacters(s: string): number {
  return new Set(s.replace(/\s+/gm, '')).size;
}

function commonCharacters(group: string): number {
  const people = group.split('\n').map(p => new Set(p))
  return [...people[0]].reduce((acc, c) => {
    if (people.every(p => p.has(c))) acc += 1;
    return acc;
  }, 0)
}

const groups = loadDay(6).split('\n\n');
console.log({
  1: sum(groups.map(uniqueCharacters)),
  2: sum(groups.map(commonCharacters)),
})
