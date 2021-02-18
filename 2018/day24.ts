import { answers, example, load } from '../advent';
import { Counter, sum, XMap } from '../util';

type DamageType = string;
type GroupKey = {
  type: string;
  id: number;
};
type Group = GroupKey & {
  units: number;
  hp: number;
  weak: Set<DamageType>;
  immune: Set<DamageType>;
  attackDamage: number;
  attackType: DamageType;
  initiative: number;
};
const Standoff = Symbol('standoff');
type Army = XMap<GroupKey, Group>;
const h = ({ type, id }: GroupKey) => `${type} ${id}`;
const effectivePower = (g: Group): number => g.units * g.attackDamage;

function parse(paragraphs: string[][]): Army {
  const re = /^(?<units>\d+) units.* (?<hp>\d+) hit points (?<special>\(.*\))?.* does (?<dmg>\d+) (?<type>\w+) .* (?<init>\d+)$/;
  function special(s: string) {
    const rv: Partial<{ weak: string[]; immune: string[] }> = {};
    s.slice(1, s.length - 1)
      .split('; ')
      .map((chunk) => {
        const [sType, types] = chunk.split(' to ');
        rv[sType] = types.split(', ');
      });
    return rv;
  }

  const groups = new XMap<GroupKey, Group>(h);
  for (const [i, type] of [
    [0, 'immune system'],
    [1, 'infection'],
  ] as [number, string][]) {
    paragraphs[i].slice(1).forEach((line, i) => {
      const g = line.match(re).groups;
      const key = { type, id: i + 1 };
      groups.set(key, {
        ...key,
        units: Number(g.units),
        hp: Number(g.hp),
        weak: new Set(g.special ? special(g.special).weak : []),
        immune: new Set(g.special ? special(g.special).immune : []),
        attackDamage: Number(g.dmg),
        attackType: g.type,
        initiative: Number(g.init),
      });
    });
  }

  return groups;
}

function damageDealt(by: Group, to: Group): number {
  return (
    effectivePower(by) *
    (to.weak.has(by.attackType) ? 2 : to.immune.has(by.attackType) ? 0 : 1)
  );
}

function byEffectivePowerThenInitiative(a: Group, b: Group): number {
  if (effectivePower(b) === effectivePower(a))
    return b.initiative - a.initiative;
  return effectivePower(b) - effectivePower(a);
}

function byDamageDealt(g: Group) {
  return function (a: Group, b: Group): number {
    if (damageDealt(g, b) === damageDealt(g, a))
      return byEffectivePowerThenInitiative(a, b);
    return damageDealt(g, b) - damageDealt(g, a);
  };
}

function fight(groups: Army, boost: number = 0): Army | typeof Standoff {
  const withBoost = (g: Group): Group => ({
    ...g,
    attackDamage:
      g.type === 'immune system' ? g.attackDamage + boost : g.attackDamage,
  });
  groups = new XMap(
    h,
    groups.entries().map(([k, v]) => [k, withBoost(v)])
  );

  const armiesLeft = () =>
    new Counter(
      groups
        .values()
        .filter((g) => g.units > 0)
        .map((g) => g.type)
    ).length;

  while (armiesLeft() > 1) {
    // Target selection phase.
    const attackers = groups.values().sort(byEffectivePowerThenInitiative);
    const targets = groups.copy();
    const pairs: { attacker: Group; target: Group }[] = [];
    for (const attacker of attackers) {
      const target = targets
        .values()
        .filter((t) => t.units > 0 && attacker.type !== t.type)
        .sort(byDamageDealt(attacker))
        .shift();
      if (target && damageDealt(attacker, target) > 0) {
        pairs.push({ attacker, target });
        targets.delete(target);
      }
    }

    // Attack phase.
    pairs.sort((a, b) => b.attacker.initiative - a.attacker.initiative);
    let totalUnitsKilled = 0;
    for (const { attacker, target } of pairs) {
      if (attacker.units <= 0) continue;
      const dmg = damageDealt(attacker, target);
      const unitsKilled = Math.min(target.units, Math.floor(dmg / target.hp));
      totalUnitsKilled += unitsKilled;
      target.units -= unitsKilled;
      if (target.units <= 0) groups.delete(target);
    }
    if (totalUnitsKilled === 0) return Standoff;
  }
  return groups;
}

function remainingUnits(groups: Army | typeof Standoff): number {
  if (groups === Standoff) return -1;
  return sum(groups.values().map((g) => g.units));
}

const exampleArmies = parse(load(24, 'ex').paragraphs);
example.equal(remainingUnits(fight(exampleArmies)), 5216);
example.equal(remainingUnits(fight(exampleArmies, 1570)), 51);

const armies = parse(load(24).paragraphs);
answers.expect(18280, 4573);
answers(
  () => remainingUnits(fight(armies)),
  () => {
    let low = 1;
    let high = 5000;
    const success = (groups: ReturnType<typeof fight>): boolean =>
      groups !== Standoff && groups.values()[0].type === 'immune system';
    while (low < high) {
      const boost = Math.floor((low + high) / 2);
      if (success(fight(armies, boost))) high = boost;
      else low = boost + 1;
    }
    return remainingUnits(fight(armies, low));
  }
);
