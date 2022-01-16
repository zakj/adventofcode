import { load, solve } from '../advent';
import { Counter, last, pairs, range } from '../util';

function parse(paras: string[][]) {
  const template = paras.shift()[0];
  const rules = new Map(
    paras.shift().map((line) => {
      const [left, right] = line.split(' -> ', 2);
      return [left, right];
    })
  );
  return { template, rules };
}

function step(
  pairCounts: Counter<string>,
  rules: Map<string, string>
): Counter<string> {
  return [...pairCounts.entries()].reduce((pc, [pair, n]) => {
    const [a, b] = [pair[0], pair[1]];
    const ins = rules.get(pair);
    pc.incr(a + ins, n);
    pc.incr(ins + b, n);
    return pc;
  }, new Counter<string>());
}

function countCharacters(
  input: string,
  rules: Map<string, string>,
  steps: number
): Counter<string> {
  const start = new Counter<string>(
    pairs(input.split('')).map((p) => p.join(''))
  );
  const pairCount = range(0, steps).reduce((pc) => step(pc, rules), start);
  const totalCount = new Counter<string>([last(input.split(''))]);
  for (const [pair, n] of pairCount.entries()) {
    totalCount.incr(pair[0], n);
  }
  return totalCount;
}

const data = parse(load().paragraphs);
export default solve(
  () => {
    const counts = countCharacters(data.template, data.rules, 10);
    return counts.mostCommon[0][1] - last(counts.mostCommon)[1];
  },
  () => {
    const counts = countCharacters(data.template, data.rules, 40);
    return counts.mostCommon[0][1] - last(counts.mostCommon)[1];
  }
).expect(3555, 4439442043739);
