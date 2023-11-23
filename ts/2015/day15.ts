import { main } from 'lib/advent';
import { iter } from 'lib/iter';
import { lines, product, range, sum } from 'lib/util';

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

function parse(s: string): Ingredient[] {
  return lines(s).map((line) => {
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

function allCookies(ingredients: Ingredient[], maxTsp = 100): Cookie[] {
  return combinationsSummingTo(maxTsp, ingredients.length).map(
    (combo) => new Cookie(ingredients, combo)
  );
}

function highestScore(cookies: Cookie[]): number {
  return iter(cookies).pluck('score').max();
}

main(
  (s) => highestScore(allCookies(parse(s))),
  (s) => highestScore(allCookies(parse(s)).filter((c) => c.calories === 500))
);
