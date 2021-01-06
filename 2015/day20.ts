import { answers } from "./advent";

function visitHouses(target: number, elfMultiplier: number, elfVisits: number = Infinity) {
  const houseLen = Math.round(target / elfMultiplier);
  const houses = new Array(houseLen).fill(0);
  for (let elf = 1; elf < houseLen; ++elf) {
    let visits = 0;
    for (let house = elf; house < houseLen && visits < elfVisits; house += elf) {
      houses[house] += elf * elfMultiplier;
      visits++;
    }
  }
  return houses.findIndex((h) => h >= target);
}

const TARGET = 36000000;
answers(
  () => visitHouses(TARGET, 10),
  () => visitHouses(TARGET, 11, 50)
)
