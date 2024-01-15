import { main } from 'lib/advent';
import { paragraphs, sum } from 'lib/util';

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

main(
  (s) => sum(paragraphs(s).map(uniqueCharacters)),
  (s) => sum(paragraphs(s).map(commonCharacters))
);
