import { loadDay } from './util';

const data = loadDay(1).map(x => parseInt(x, 10));

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

const part1 = data.map(mass => fuelRequired(mass)).reduce((acc, x) => acc + x);
console.log(part1);

const part2 = data.map(mass => fuelRequiredPlusFuel(mass)).reduce((acc, x) => acc + x);
console.log(part2);
