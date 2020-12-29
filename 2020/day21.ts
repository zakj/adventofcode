import { answers, example, loadDayLines } from './util';

type Food = {
  ingredients: Set<string>
  allergens: Set<string>
}

function parseFoods(lines: string[]): Food[] {
  return lines.map((line) => {
    const s = line.replace(')', '').split(' (contains ');
    return {
      ingredients: new Set(s[0].split(' ')),
      allergens: new Set(s[1].split(', ')),
    };
  });
}

function intersectAll<T>(sets: Set<T>[]): Set<T> {
  const [head, ...tail] = sets;
  return new Set([...head].filter(x => tail.every(xs => xs.has(x))))
}

function findAllergens(foods: Food[]): Map<string, string> {
  const possibles: Record<string, Set<string>[]> = {};
  for (const food of foods) {
    for (const allergen of food.allergens) {
      possibles[allergen] ||= [];
      possibles[allergen].push(new Set(food.ingredients))
    }
  }

  const allergens = new Map();
  while (allergens.size < Object.values(possibles).length) {
    for (const [allergen, options] of Object.entries(possibles)) {
      options.forEach(o => {
        for (const a of allergens.values()) {
          o.delete(a)
        }
      })
      const intr = intersectAll(options);
      if (intr.size === 1) allergens.set(allergen, [...intr][0]);
      possibles[allergen] = [intr];
    }
  }
  return allergens;
}

function safeFoods(foods: Food[]): Set<string> {
  const allergens = new Set(findAllergens(foods).values());
  const safe = new Set<string>();
  for (const food of foods) {
    [...food.ingredients]
      .filter((ingr) => !allergens.has(ingr))
      .forEach((ingr) => safe.add(ingr));
  }
  return safe;
}

function part1(foods: Food[]): number {
  const safe = safeFoods(foods)
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
  return keys.map(k => allergens.get(k)).join(',')
}

const exampleFoods = parseFoods(loadDayLines(21, 'example'));
example.deepEqual(new Set(['kfcds', 'nhms', 'sbzzf', 'trh']), safeFoods(exampleFoods));
example.equal(5, part1(exampleFoods));
example.equal('mxmxvkd,sqjhc,fvjkl', part2(exampleFoods));

const foods = parseFoods(loadDayLines(21))
answers(
  () => part1(foods),
  () => part2(foods)
);
