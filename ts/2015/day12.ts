import { main } from 'lib/advent';
import { sum } from 'lib/util';

function ignoreRed(obj: unknown): number {
  let values: unknown[];
  if (typeof obj === 'string') {
    return 0;
  } else if (typeof obj === 'number') {
    return obj;
  } else if (Array.isArray(obj)) {
    values = obj;
  } else {
    values = Object.values(obj);
    if (values.includes('red')) return 0;
  }
  return values.reduce<number>((acc, v) => acc + ignoreRed(v), 0);
}

main(
  (s) => sum(s.match(/-?\d+/g).map(Number)),
  (s) => ignoreRed(JSON.parse(s))
);
