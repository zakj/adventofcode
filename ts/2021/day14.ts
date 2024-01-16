import { main } from 'lib/advent';
import { Counter } from 'lib/collections';
import { last, pairs, paragraphs, range } from 'lib/util';

type Data = {
  template: string;
  rules: Map<string, string>;
};

function parse(paras: string[][]): Data {
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

function insert({ template, rules }: Data, steps: number) {
  const counts = countCharacters(template, rules, steps);
  return counts.mostCommon[0][1] - last(counts.mostCommon)[1];
}

main(
  (s) => insert(parse(paragraphs(s)), 10),
  (s) => insert(parse(paragraphs(s)), 40)
);
