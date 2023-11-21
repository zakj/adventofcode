import { main } from 'lib/advent';
import { Iter, iter } from 'lib/iter';

const floorChanges: Record<string, number> = {
  '(': 1,
  ')': -1,
};

const changes = (input: string): Iter<number> =>
  iter(input.trim().split(''))
    .filter((c) => c in floorChanges)
    .map((c) => floorChanges[c]);

main(
  (s) => changes(s).sum(),
  (s) =>
    changes(s)
      .scan((floor, move) => floor + move, 0)
      .findIndex((f) => f < 0)
);
