import { answers, example, load } from '../advent';
import { sum } from '../util';

function parse(input: string): number[] {
  return input.trim().split(',').map(Number);
}

function simulateNaive(fish: number[], days: number): number[] {
  for (let day = 0; day < days; ++day) {
    const newFish = [];

    const startFishLength = fish.length;
    for (let i = 0; i < startFishLength; ++i) {
      if (fish[i] === 0) {
        fish[i] = 6;
        fish.push(8);
      } else {
        fish[i]--;
      }
    }
  }
  return fish;
}

function simulate(fish: number[], days: number): number {
  const counts = new Array(9).fill(0);
  fish.forEach((f) => {
    counts[f]++;
  });
  for (let day = 0; day < days; ++day) {
    const zeros = counts.shift();
    counts[6] += zeros;
    counts[8] = zeros;
  }
  return sum(counts);
}

const exampleFish = parse(load(6, 'ex').raw);
example.equal(simulate(exampleFish.slice(), 18), 26);
example.equal(simulate(exampleFish.slice(), 80), 5934);
example.equal(simulate(exampleFish.slice(), 256), 26984457539);

const fish = parse(load(6).raw);
answers.expect(352195);
answers(
  () => simulate(fish.slice(), 80),
  () => simulate(fish.slice(), 256)
);
