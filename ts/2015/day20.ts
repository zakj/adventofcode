import { main } from 'lib/advent';
import { allNumbers } from 'lib/util';

function visitHouses(
  target: number,
  elfMultiplier: number,
  elfVisits = Infinity
) {
  const houseLen = Math.round(target / elfMultiplier);
  const houses = new Array(houseLen).fill(0);
  for (let elf = 1; elf < houseLen; ++elf) {
    let visits = 0;
    for (
      let house = elf;
      house < houseLen && visits < elfVisits;
      house += elf
    ) {
      houses[house] += elf * elfMultiplier;
      visits++;
    }
  }
  return houses.findIndex((h) => h >= target);
}

main(
  (s) => visitHouses(allNumbers(s)[0], 10),
  (s) => visitHouses(allNumbers(s)[0], 11, 50)
);
