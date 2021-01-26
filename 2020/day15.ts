import { answers, example } from '../advent';

function spokenNumber(input: number[], n: number): number {
  const lastSaid: { [k: number]: number[] } = {};
  input.forEach((x, i) => {
    lastSaid[x] ||= [];
    lastSaid[x].push(i);
  });
  let last = input[input.length - 1];
  for (let i = input.length; i < n; ++i) {
    let speak = 0;
    if (lastSaid[last].length > 1) {
      speak =
        lastSaid[last][lastSaid[last].length - 1] -
        lastSaid[last][lastSaid[last].length - 2];
    }
    lastSaid[speak] ||= [];
    lastSaid[speak].push(i);
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

answers(
  () => spokenNumber([18, 8, 0, 5, 4, 1, 20], 2020),
  () => spokenNumber([18, 8, 0, 5, 4, 1, 20], 30000000)
);
