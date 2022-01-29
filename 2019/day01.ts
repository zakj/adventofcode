import { load, solve } from 'lib/advent';
import { sum } from 'lib/util';

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

const data = load().numbers;
export default solve(
  () => sum(data.map(fuelRequired)),
  () => sum(data.map(fuelRequiredPlusFuel))
).expect(3420719, 5128195);
