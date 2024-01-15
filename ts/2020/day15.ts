import { main } from 'lib/advent';
import { allNumbers } from 'lib/util';

function spokenNumber(input: number[], n: number): number {
  const lastSaid = new Array(n);
  input.forEach((x, i) => (lastSaid[x] = i + 1));
  let last = input[input.length - 1];
  for (let i = input.length; i < n; ++i) {
    const speak = last in lastSaid ? i - lastSaid[last] : 0;
    lastSaid[last] = i;
    last = speak;
  }
  return last;
}

main(
  (s) => spokenNumber(allNumbers(s), 2020),
  (s) => spokenNumber(allNumbers(s), 30000000)
);
