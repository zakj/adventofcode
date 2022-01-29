import { example, load, solve } from 'lib/advent';

type Food = {
  ingredients: Set<string>;
  allergens: Set<string>;
};

function parseFoods(lines: string[]): Food[] {
  return lines.map((line) => {
    const s = line.replace(')', '').split(' (contains ');
    return {
      ingredients: new Set(s[0].split(' ')),
      allergens: new Set(s[1].split(', ')),
    };
  });
}

function intersect<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter((x) => b.has(x)));
}

function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter((x) => !b.has(x)));
}

function findAllergens(foods: Food[]): Map<string, string> {
  const possibles = foods.reduce((acc, food) => {
    for (const allergen of food.allergens) {
      acc.set(
        allergen,
        acc.has(allergen)
          ? intersect(acc.get(allergen), food.ingredients)
          : food.ingredients
      );
    }
    return acc;
  }, new Map<string, Set<string>>());

  const allergens = new Map<string, string>();
  while (allergens.size < possibles.size) {
    for (const [allergen, ingr] of possibles.entries()) {
      for (const a of allergens.values()) {
        ingr.delete(a);
      }
      if (ingr.size === 1) allergens.set(allergen, [...ingr][0]);
    }
  }
  return allergens;
}

function safeFoods(foods: Food[]): Set<string> {
  const allergens = new Set(findAllergens(foods).values());
  const allIngredients = foods.reduce((ingrs, food) => {
    [...food.ingredients].map((ingr) => ingrs.add(ingr));
    return ingrs;
  }, new Set<string>());
  return difference(allIngredients, allergens);
}

function part1(foods: Food[]): number {
  const safe = safeFoods(foods);
  let safeCount = 0;
  for (const food of foods) {
    for (const ingr of food.ingredients) {
      if (safe.has(ingr)) safeCount++;
    }
  }
  return safeCount;
}

function part2(foods: Food[]): string {
  const allergens = findAllergens(foods);
  const keys = [...allergens.keys()];
  keys.sort();
  return keys.map((k) => allergens.get(k)).join(',');
}

const exampleFoods = parseFoods(load('ex').lines);
example.deepEqual(
  new Set(['kfcds', 'nhms', 'sbzzf', 'trh']),
  safeFoods(exampleFoods)
);
example.equal(5, part1(exampleFoods));
example.equal('mxmxvkd,sqjhc,fvjkl', part2(exampleFoods));

const foods = parseFoods(load().lines);
export default solve(
  () => part1(foods),
  () => part2(foods)
).expect(2061, 'cdqvp,dglm,zhqjs,rbpg,xvtrfz,tgmzqjz,mfqgx,rffqhl');
