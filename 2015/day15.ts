import { example, load, solve } from '../advent';
import { product, range, sum } from '../util';

class Cookie {
  constructor(private ingredients: Ingredient[], private tsps: number[]) {}

  private scoreProp(propName: string): number {
    return Math.max(
      0,
      sum(
        range(0, this.ingredients.length).map(
          (i) => this.ingredients[i].properties.get(propName) * this.tsps[i]
        )
      )
    );
  }

  get calories(): number {
    return this.scoreProp('calories');
  }

  get score(): number {
    return product(
      [...this.ingredients[0].properties.keys()]
        .filter((pn) => pn !== 'calories')
        .map((pn) => this.scoreProp(pn))
    );
  }
}

type Ingredient = {
  name: string;
  properties: Map<string, number>;
};

function parse(lines: string[]): Ingredient[] {
  return lines.map((line) => {
    const [name, propertiesStr] = line.split(': ');
    const properties = new Map(
      propertiesStr.split(', ').map((p) => {
        const [prop, val] = p.split(' ');
        return [prop, Number(val)];
      })
    );
    return { name, properties };
  });
}

function combinationsSummingTo(sum: number, n: number): number[][] {
  if (n === 1) {
    return [[sum]];
  }
  let results: number[][] = [];
  for (let i = 1; i < sum - n; ++i) {
    results = results.concat(
      combinationsSummingTo(sum - i, n - 1).map((c) => [i].concat(c))
    );
  }
  return results;
}

function allCookies(ingredients: Ingredient[], maxTsp: number = 100): Cookie[] {
  return combinationsSummingTo(maxTsp, ingredients.length).map(
    (combo) => new Cookie(ingredients, combo)
  );
}

function highestScore(cookies: Cookie[]): number {
  return cookies
    .map((c) => c.score)
    .reduce((max, score) => (score > max ? score : max), -Infinity);
}

const exampleIngredients = parse(load('ex').lines);
example.equal(highestScore(allCookies(exampleIngredients)), 62842880);
example.equal(
  highestScore(
    allCookies(exampleIngredients).filter((c) => c.calories === 500)
  ),
  57600000
);

const ingredients = parse(load().lines);
export default solve(
  () => highestScore(allCookies(ingredients)),
  () => highestScore(allCookies(ingredients).filter((c) => c.calories === 500))
).expect(222870, 117936);
