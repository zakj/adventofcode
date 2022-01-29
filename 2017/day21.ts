import { example, load, solve } from '../advent';
import { chunks, zip } from '../util';

type Grid = string;
type Rules = Map<string, string>;

function parse(lines: string[]): Rules {
  return new Map(
    lines.map((line) => {
      const [from, to] = line.split(' => ');
      return [from, to];
    })
  );
}

function rotate(rule: string): string {
  const rows = rule.split('/').map((r) => r.split(''));
  return zip(...rows)
    .map((r) => r.reverse().join(''))
    .join('/');
}

function flip(rule: string): string {
  const rows = rule.split('/');
  return [...rows].reverse().join('/');
}

function augmentRules(rules: Rules): Rules {
  rules = new Map(rules);
  for (const [from, to] of rules) {
    for (let rule of [from, flip(from)]) {
      rules.set(rule, to);
      for (let i = 0; i < 3; ++i) {
        rule = rotate(rule);
        rules.set(rule, to);
      }
    }
  }
  return rules;
}

function cycle(grid: Grid, rules: Rules) {
  const rows = grid.split('/');
  const subgridSize = rows[0].length % 2 === 0 ? 2 : 3;
  const subgrids = chunks(rows, subgridSize).map((rowChunk) =>
    zip(
      ...rowChunk.map((row) =>
        chunks(row.split(''), subgridSize).map((c) => c.join(''))
      )
    ).map((subgrid) => rules.get(subgrid.join('/')))
  );
  return subgrids
    .flatMap((gridRow) => {
      return zip(...gridRow.map((grid) => grid.split('/'))).map((row) =>
        row.join('')
      );
    })
    .join('/');
}

function cycles(n: number, grid: Grid, rules: Rules): Grid {
  for (let i = 0; i < n; ++i) {
    grid = cycle(grid, rules);
  }
  return grid;
}

function countPixels(grid: Grid): number {
  return grid.split('').filter((x) => x === '#').length;
}

const start = '.#./..#/###';

const exampleRules = augmentRules(parse(load('ex').lines));
example.equal(countPixels(cycles(2, start, exampleRules)), 12);

const rules = augmentRules(parse(load().lines));
export default solve(
  () => countPixels(cycles(5, start, rules)),
  () => countPixels(cycles(18, start, rules))
).expect(120, 2204099);
