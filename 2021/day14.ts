import { answers, load } from '../advent';
import { Counter, DefaultDict, pairs } from '../util';

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

function step(input: string, rules: Map<string, string>): string {
  const output = [input[0]];
  for (const [a, b] of pairs(input.split(''))) {
    output.push(rules.get(a + b));
    output.push(b);
  }
  return output.join('');
}

const data = parse(load(14).paragraphs);
answers.expect(3555, 4439442043739);
answers(
  () => {
    let string = data.template;
    for (let i = 0; i < 10; ++i) {
      string = step(string, data.rules);
    }
    const counts = new Counter(string.split(''));
    const common = counts.mostCommon;
    return common[0][1] - common[common.length - 1][1];
  },
  () => {
    let string = data.template;
    let pairCount = new DefaultDict<string, number>(() => 0);
    pairs(data.template.split(''))
      .map((p) => p.join(''))
      .forEach((pair) => pairCount.set(pair, pairCount.get(pair) + 1));
    for (let i = 0; i < 40; ++i) {
      const newPairs = new DefaultDict<string, number>(() => 0);
      for (const [pair, n] of pairCount.entries()) {
        const [a, b] = pair.split('', 2);
        const ins = data.rules.get(pair);
        newPairs.set(a + ins, newPairs.get(a + ins) + n);
        newPairs.set(ins + b, newPairs.get(ins + b) + n);
      }
      pairCount = newPairs;
    }
    const totalCount = new DefaultDict<string, number>(() => 0);
    totalCount.set(data.template[data.template.length - 1], 1);
    for (const [pair, n] of pairCount.entries()) {
      totalCount.set(pair[0], totalCount.get(pair[0]) + n);
    }
    const sorted = [...totalCount.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0][1] - sorted[sorted.length - 1][1];
  }
);
