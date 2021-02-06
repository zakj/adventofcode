import { answers, example, load } from '../advent';
import { sum } from '../util';

const RULE_WIDTH = 5;
type State = {
  plants: string;
  offset: number;
};
type Rules = Map<string, string>;

function parse(paras: string[][]): [State, Rules] {
  const plants = paras[0][0].split(' ')[2];
  const rules: Rules = new Map();
  for (const rule of paras[1]) {
    const [k, v] = rule.split(' => ');
    rules.set(k, v);
  }
  return [{ plants, offset: 0 }, rules];
}

function padPlants(state: State): State {
  const paddingWidth = RULE_WIDTH - 1;
  let { plants, offset } = state;
  const firstPlant = plants.indexOf('#');
  plants = plants.slice(firstPlant);
  plants = plants.padStart(plants.length + paddingWidth, '.');
  offset += firstPlant - paddingWidth;
  const lastPlant = plants.lastIndexOf('#');
  plants = plants.slice(0, lastPlant + 1);
  plants = plants.padEnd(plants.length + paddingWidth, '.');
  return { plants, offset };
}

function cycle(start: State, rules: Rules): State {
  const state = padPlants(start);
  const padding = (RULE_WIDTH - 1) / 2;
  const next = [];
  for (let i = padding; i < state.plants.length - padding; ++i) {
    const slice = state.plants.slice(i - padding, i + padding + 1);
    next.push(rules.get(slice) || '.');
  }
  return { plants: next.join(''), offset: state.offset + padding };
}

function cycles(state: State, rules: Rules, n: number): number {
  let prevScore = score(state);
  let prevDelta = 0;
  let i: number;
  for (i = 0; i < n; ++i) {
    state = cycle(state, rules);
    const thisScore = score(state);
    const thisDelta = thisScore - prevScore;
    prevScore = thisScore;
    if (thisDelta === prevDelta) break;
    prevDelta = thisDelta;
  }
  if (n === i) return score(state);
  return (n - i - 1) * prevDelta + prevScore;
}

function score(state: State): number {
  return sum(
    state.plants.split('').map((x, i) => (x === '#' ? i + state.offset : 0))
  );
}

const [exampleStart, exampleRules] = parse(load(12, 'ex').paragraphs);
example.equal(cycles(exampleStart, exampleRules, 20), 325);

const [start, rules] = parse(load(12).paragraphs);
answers.expect(3738, 3900000002467);
answers(
  () => cycles(start, rules, 20),
  () => cycles(start, rules, 50e9)
);
