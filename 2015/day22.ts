import { answers } from './advent';

type Effect = {
  turns: number;
  damage?: number;
  armor?: number;
  mana?: number;
};

type Spell = {
  mana: number;
  damage?: number;
  heal?: number;
  effect?: Effect;
};

const spells = [
  { mana: 53, damage: 4 },
  { mana: 73, damage: 2, heal: 2 },
  { mana: 113, effect: { turns: 6, armor: 7 } },
  { mana: 173, effect: { turns: 6, damage: 3 } },
  { mana: 229, effect: { turns: 5, mana: 101 } },
];

type Character = {
  hp: number;
};
type Player = Character & {
  mana: number;
};
type Boss = Character & {
  damage: number;
};

function minManaToWin(
  player: Player,
  boss: Boss,
  hardMode: boolean = false,
  spell?: Spell,
  effectTimer?: Map<Effect, number>
): number {
  player = { ...player };
  boss = { ...boss };
  effectTimer = new Map<Effect, number>(effectTimer);
  let manaUsed = 0;

  function applyEffects() {
    let playerArmor = 0;
    for (let [effect, turns] of effectTimer.entries()) {
      if (effect.armor) playerArmor = effect.armor;
      if (effect.damage) boss.hp -= effect.damage;
      if (effect.mana) player.mana += effect.mana;
      turns--;
      if (turns < 1) effectTimer.delete(effect);
      else effectTimer.set(effect, turns);
    }
    return playerArmor;
  }

  if (spell) {
    if (hardMode) {
      player.hp--;
      if (player.hp < 1) return 0;
    }
    applyEffects();
    if (boss.hp < 1) return manaUsed;

    player.mana -= spell.mana;
    manaUsed += spell.mana;
    if (spell.damage) boss.hp -= spell.damage;
    if (spell.heal) player.hp += spell.heal;
    if (spell.effect) effectTimer.set(spell.effect, spell.effect.turns);
    if (boss.hp < 1) return manaUsed;

    const playerArmor = applyEffects();
    if (boss.hp < 1) return manaUsed;
    player.hp -= Math.max(1, boss.damage - playerArmor);
    if (player.hp < 1) return 0;
  }

  const wins = spells
    .filter(
      (s) =>
        s.mana <= player.mana && (!s.effect || !effectTimer.has(s.effect))
    )
    .map((s) => minManaToWin(player, boss, hardMode, s, effectTimer))
    .filter((mana) => mana > 0);
  if (wins.length) {
    const minMana = (min, mana) => (mana < min ? mana : min);
    return wins.reduce(minMana) + manaUsed;
  }
  return 0;
}

const player: Player = { hp: 50, mana: 500 };
const boss: Boss = { hp: 51, damage: 9 };
answers(
  () => minManaToWin(player, boss),
  () => minManaToWin(player, boss, true)
);
