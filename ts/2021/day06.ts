import { main } from 'lib/advent';
import { allNumbers, sum } from 'lib/util';

function simulate(fish: number[], days: number): number {
  const counts = new Array(9).fill(0);
  fish.forEach((f) => counts[f]++);
  for (let day = 0; day < days; ++day) {
    const zeros = counts.shift();
    counts[6] += zeros;
    counts.push(zeros);
  }
  return sum(counts);
}

main(
  (s) => simulate(allNumbers(s), 80),
  (s) => simulate(allNumbers(s), 256)
);
