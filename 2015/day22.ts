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

type State = {
  hp: number;
  mana: number;
  bossHp: number;
  bossDamage: number;
  manaUsed: number;
  effectTimer: Map<Effect, number>,
  hardMode: boolean;
}

type SharedState = {
  minFound: number;
}

const spells = [
  { mana: 53, damage: 4 },
  { mana: 73, damage: 2, heal: 2 },
  { mana: 113, effect: { turns: 6, armor: 7 } },
  { mana: 173, effect: { turns: 6, damage: 3 } },
  { mana: 229, effect: { turns: 5, mana: 101 } },
];

function minManaToWin(
  state: State,
  sharedState: SharedState,
  spell?: Spell,
): number {
  state = { ...state };
  state.effectTimer = new Map<Effect, number>(state.effectTimer);

  const win = (n: number) => sharedState.minFound = Math.min(sharedState.minFound, n)

  function applyEffects() {
    let playerArmor = 0;
    for (let [effect, turns] of state.effectTimer.entries()) {
      if (effect.armor) playerArmor = effect.armor;
      if (effect.damage) state.bossHp -= effect.damage;
      if (effect.mana) state.mana += effect.mana;
      turns--;
      if (turns < 1) state.effectTimer.delete(effect);
      else state.effectTimer.set(effect, turns);
    }
    return playerArmor;
  }

  if (spell) {
    if (state.hardMode) {
      state.hp--;
      if (state.hp < 1) return 0;
    }
    applyEffects();
    if (state.bossHp < 1) return win(state.manaUsed);

    if (spell.mana > state.mana || (spell.effect && state.effectTimer.has(spell.effect))) return 0;
    state.mana -= spell.mana;
    state.manaUsed += spell.mana;
    if (spell.damage) state.bossHp -= spell.damage;
    if (spell.heal) state.hp += spell.heal;
    if (spell.effect) state.effectTimer.set(spell.effect, spell.effect.turns);
    if (state.bossHp < 1) return win(state.manaUsed);

    const playerArmor = applyEffects();
    if (state.bossHp < 1) return win(state.manaUsed);
    state.hp -= Math.max(1, state.bossDamage - playerArmor);
    if (state.hp < 1) return 0;
  }

  const wins = spells
    .filter((s) => s.mana + state.manaUsed < sharedState.minFound)
    .map((s) => minManaToWin(state, sharedState, s))
    .filter((mana) => mana > 0);
  if (wins.length) {
    const minMana = (min, mana) => (mana < min ? mana : min);
    return win(wins.reduce(minMana));
  }
  return 0;
}

const initialState: State = {
  hp: 50,
  mana: 500,
  bossHp: 51,
  bossDamage: 9,
  manaUsed: 0,
  effectTimer: new Map<Effect, number>(),
  hardMode: false,
}

answers(
  () => minManaToWin(initialState, {minFound: Infinity}),
  () => minManaToWin({...initialState, hardMode: true}, {minFound: Infinity})
);
