import { main } from 'lib/advent';
import { allNumbers, combinations, sum } from 'lib/util';

type Item = {
  name: number;
  cost: number;
  damage: number;
  armor: number;
};

const storeMap = ([name, cost, damage, armor]) => ({
  name,
  cost,
  damage,
  armor,
});

const weapons: Item[] = [
  ['Dagger', 8, 4, 0],
  ['Shortsword', 10, 5, 0],
  ['Warhammer', 25, 6, 0],
  ['Longsword', 40, 7, 0],
  ['Greataxe', 74, 8, 0],
].map(storeMap);

const armors: Item[] = [
  ['None', 0, 0, 0],
  ['Leather', 13, 0, 1],
  ['Chainmail', 31, 0, 2],
  ['Splintmail', 53, 0, 3],
  ['Bandedmail', 75, 0, 4],
  ['Platemail', 102, 0, 5],
].map(storeMap);

const rings: Item[] = [
  ['None', 0, 0, 0],
  ['None', 0, 0, 0],
  ['Damage +1', 25, 1, 0],
  ['Damage +2', 50, 2, 0],
  ['Damage +3', 100, 3, 0],
  ['Defense +1', 20, 0, 1],
  ['Defense +2', 40, 0, 2],
  ['Defense +3', 80, 0, 3],
].map(storeMap);

class Character {
  constructor(
    public hp: number,
    public damage: number,
    public armor: number,
  ) {}

  attack(other: Character) {
    other.hp -= Math.max(this.damage - other.armor, 1);
  }
}

function playerWins(player: Character, boss: Character): boolean {
  for (;;) {
    player.attack(boss);
    if (boss.hp <= 0) return true;
    boss.attack(player);
    if (player.hp <= 0) return false;
  }
}

function allOptions(weapons: Item[], armors: Item[], rings: Item[]) {
  const options = [];
  for (const weapon of weapons) {
    for (const armor of armors) {
      for (const [ring1, ring2] of combinations(rings)) {
        const items = [weapon, armor, ring1, ring2];
        options.push({
          cost: sum(items.map((x) => x.cost)),
          damage: sum(items.map((x) => x.damage)),
          armor: sum(items.map((x) => x.armor)),
        });
      }
    }
  }
  return options;
}

function costOfBestPurchases(s: string, shouldWin = true): number {
  const [bossHp, bossDamage, bossArmor] = allNumbers(s);
  const makeBoss = () => new Character(bossHp, bossDamage, bossArmor);
  const options = allOptions(weapons, armors, rings);
  options.sort((a, b) => a.cost - b.cost);
  if (!shouldWin) options.reverse();
  return options.find(
    (opt) =>
      playerWins(new Character(playerHp, opt.damage, opt.armor), makeBoss()) ==
      shouldWin,
  ).cost;
}

const playerHp = 100;
main(
  (s) => costOfBestPurchases(s),
  (s) => costOfBestPurchases(s, false),
);
