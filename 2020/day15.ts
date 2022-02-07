import { example, load, solve } from 'lib/advent';

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

example.equal(0, spokenNumber([0, 3, 6], 10));
example.equal(1, spokenNumber([1, 3, 2], 2020));
example.equal(10, spokenNumber([2, 1, 3], 2020));
example.equal(27, spokenNumber([1, 2, 3], 2020));
example.equal(78, spokenNumber([2, 3, 1], 2020));
example.equal(438, spokenNumber([3, 2, 1], 2020));
example.equal(1836, spokenNumber([3, 1, 2], 2020));

const numbers = load().raw.trim().split(',').map(Number);
export default solve(
  () => spokenNumber(numbers, 2020),
  () => spokenNumber(numbers, 30000000)
).expect(253, 13710);
