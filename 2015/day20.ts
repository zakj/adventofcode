import { load, solve } from 'lib/advent';

function visitHouses(
  target: number,
  elfMultiplier: number,
  elfVisits: number = Infinity
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

const target = load().numbers[0];
export default solve(
  () => visitHouses(target, 10),
  () => visitHouses(target, 11, 50)
).expect(831600, 884520);
