import { main } from 'lib/advent';
import { allNumbers, sum } from 'lib/util';

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

main(
  (s) => sum(allNumbers(s).map(fuelRequired)),
  (s) => sum(allNumbers(s).map(fuelRequiredPlusFuel))
);
