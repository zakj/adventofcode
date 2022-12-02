import { example, load, solve } from 'lib/advent';
import { Iter, iter } from 'lib/iter';
import { ValuesOf } from 'lib/util';

type Value = 0 | 1 | 2;
function parse(lines: string[]): Iter<Value[]> {
  const map: Record<string, Value> = { A: 0, B: 1, C: 2, X: 0, Y: 1, Z: 2 };
  return iter(lines).map((line) => line.split(' ', 2).map((v) => map[v]));
}

const Strategy = {
  Lose: 0,
  Draw: 1,
  Win: 2,
} as const;
type Strategy = ValuesOf<typeof Strategy>;

const exampleData = parse([`A Y`, `B X`, `C Z`]);
example.equal(15, exampleData.map(score).sum());
example.equal(12, exampleData.map(strategizedScore).sum());

function score([a, b]: Value[]): number {
  let score = b + 1;
  if (a === b) score += 3;
  else if ((a + 1) % 3 === b) score += 6;
  return score;
}

function strategizedScore([a, b]: Value[]): number {
  if (b === Strategy.Lose) b = ((a + 2) % 3) as Value;
  else if (b === Strategy.Draw) b = a;
  else if (b === Strategy.Win) b = ((a + 1) % 3) as Value;
  return score([a, b]);
}

const games = parse(load().lines);
export default solve(
  () => games.map(score).sum(),
  () => games.map(strategizedScore).sum()
).expect(11386, 13600);
