import { example, load, solve } from '../advent';
import { sum } from '../util';

function parse(input: string): number[] {
  return input.trim().split(',').map(Number);
}

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

const exampleFish = parse(load('ex').raw);
example.equal(simulate(exampleFish, 18), 26);
example.equal(simulate(exampleFish, 80), 5934);
example.equal(simulate(exampleFish, 256), 26984457539);

const fish = parse(load().raw);
export default solve(
  () => simulate(fish, 80),
  () => simulate(fish, 256)
).expect(352195, 1600306001288);
