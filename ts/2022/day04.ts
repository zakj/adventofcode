import { main } from 'lib/advent';
import { Iter, iter } from 'lib/iter';
import { lines, range } from 'lib/util';

type Range = Set<number>;

function parse(lines: string[]): Iter<Range[]> {
  return iter(lines).map((line) =>
    line.split(',', 2).map((r) => {
      const [a, b] = r.split('-', 2).map(Number);
      return new Set(range(a, b + 1));
    })
  );
}

function contains<T>(a: Set<T>, b: Set<T>): boolean {
  return [...a].every((x) => b.has(x)) || [...b].every((x) => a.has(x));
}

function overlaps<T>(a: Set<T>, b: Set<T>): boolean {
  return [...a].some((x) => b.has(x));
}

main(
  (s) => parse(lines(s)).filter(([a, b]) => contains(a, b)).size,
  (s) => parse(lines(s)).filter(([a, b]) => overlaps(a, b)).size
);
