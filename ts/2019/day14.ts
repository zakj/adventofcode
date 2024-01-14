import { main } from 'lib/advent';
import { DefaultDict } from 'lib/collections';
import { lines } from 'lib/util';

interface Chemical {
  num: number;
  type: string;
}
type Recipe = {
  quantity: number;
  ingredients: Chemical[];
};
type Recipes = Map<string, Recipe>;

function parse(lines: string[]): Recipes {
  const chem = (s: string): Chemical => {
    const [num, type] = s.split(' ');
    return { num: Number(num), type };
  };
  const recipes = new Map();
  lines.forEach((line) => {
    const [ingredientsStr, outputStr] = line.split(' => ');
    const ingredients = ingredientsStr.split(', ').map(chem);
    const output = chem(outputStr);
    recipes.set(output.type, { quantity: output.num, ingredients });
  });
  return recipes;
}

function oreToProduce(recipes: Recipes, req: Chemical): number {
  let ore = 0;
  const surplus = new DefaultDict<string, number>(() => 0);
  const q = [req];
  while (q.length) {
    const { num, type } = q.shift();
    const recipe = recipes.get(type);
    const surplusQ = surplus.get(type);
    const neededQ = Math.max(num - surplusQ, 0);
    const n = Math.ceil(neededQ / recipe.quantity);
    const extraQ = recipe.quantity * n - (num - surplusQ);
    if (type !== 'ORE') surplus.set(type, extraQ);
    for (const ingr of recipe.ingredients) {
      if (ingr.type === 'ORE') ore += n * ingr.num;
      else q.push({ type: ingr.type, num: n * ingr.num });
    }
  }
  return ore;
}

main(
  (s) => oreToProduce(parse(lines(s)), { num: 1, type: 'FUEL' }),
  (s) => {
    let low = 1e4;
    let high = 1e9;
    while (low < high) {
      const targetFuel = Math.ceil((low + high) / 2);
      const oreCost = oreToProduce(parse(lines(s)), {
        num: targetFuel,
        type: 'FUEL',
      });
      if (oreCost > 1e12) high = targetFuel - 1;
      else low = targetFuel;
    }
    return low;
  }
);
