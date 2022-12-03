import { example, load, solve } from 'lib/advent';
import { Iter, iter } from 'lib/iter';
import { ValuesOf } from 'lib/util';

type Value = 1 | 2 | 3;
function parse(lines: string[]): Iter<Value[]> {
  const map: Record<string, Value> = { A: 1, B: 2, C: 3, X: 1, Y: 2, Z: 3 };
  return iter(lines).map((line) => line.split(' ', 2).map((v) => map[v]));
}
const winsAgainst = (v: Value): Value => ((v % 3) + 1) as Value;
const losesAgainst = (v: Value): Value => (((v + 1) % 3) + 1) as Value;

const Strategy = {
  Lose: 1,
  Draw: 2,
  Win: 3,
} as const;
type Strategy = ValuesOf<typeof Strategy>;

const exampleData = parse([`A Y`, `B X`, `C Z`]);
example.equal(15, exampleData.map(score).sum());
example.equal(12, exampleData.map(strategizedScore).sum());

function score([a, b]: Value[]): number {
  let score = b;
  if (a === b) score += 3;
  else if (b === winsAgainst(a)) score += 6;
  return score;
}

function strategizedScore([a, b]: Value[]): number {
  if (b === Strategy.Lose) b = losesAgainst(a);
  else if (b === Strategy.Draw) b = a;
  else if (b === Strategy.Win) b = winsAgainst(a);
  return score([a, b]);
}

const games = parse(load().lines);
export default solve(
  () => games.map(score).sum(),
  () => games.map(strategizedScore).sum()
).expect(11386, 13600);
