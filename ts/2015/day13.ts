import { main } from 'lib/advent';
import { DefaultDict } from 'lib/collections';
import { lines, pairs, permutations, sum } from 'lib/util';

type Guests = DefaultDict<string, Map<string, number>>;

function parse(s: string): Guests {
  const RULE_RE = /(\w+) would (gain|lose) (\d+) .* next to (\w+)\./;
  return lines(s).reduce((map, line) => {
    const [, subject, gainLose, units, object] = line.match(RULE_RE);
    map.get(subject).set(object, gainLose === 'lose' ? -units : +units);
    return map;
  }, new DefaultDict<string, Map<string, number>>(() => new Map()));
}

function happiness(guests: Guests, arrangement: string[]): number {
  return sum(
    pairs([...arrangement, arrangement[0]]).map(
      ([a, b]) => (guests.get(a)?.get(b) || 0) + (guests.get(b)?.get(a) || 0)
    )
  );
}

function findMaxHappiness(guests: Guests, extra = false): number {
  const names = [...guests.keys()];
  if (extra) names.push('me');
  return [...permutations(names)].reduce(
    (max, perm) => Math.max(max, happiness(guests, perm)),
    -Infinity
  );
}

main(
  (s) => findMaxHappiness(parse(s)),
  (s) => findMaxHappiness(parse(s), true)
);
