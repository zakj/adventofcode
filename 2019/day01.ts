import { answers, load } from '../advent';
import { sum } from '../util';

function fuelRequired(mass: number): number {
  return Math.floor(mass / 3) - 2;
}

function fuelRequiredPlusFuel(mass: number): number {
  let totalFuel = 0;
  while ((mass = fuelRequired(mass)) >= 0) {
    totalFuel += mass;
  }
  return totalFuel;
}

const data = load(1).numbers;
answers.expect(3420719, 5128195);
answers(
  () => sum(data.map(fuelRequired)),
  () => sum(data.map(fuelRequiredPlusFuel))
);
