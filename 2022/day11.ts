import { example, load, solve } from 'lib/advent';
import { product } from 'lib/util';

type Monkey = {
  items: number[];
  operation: string[];
  testDivBy: number;
  throwTo: Map<boolean, number>;
  inspections: number;
};

function parse(paragraphs: string[][]): Monkey[] {
  return paragraphs.map((lines) => {
    const items = lines[1].split(': ')[1].split(', ').map(Number);
    const operation = lines[2].split(' = ')[1].split(' ').slice(1);
    const testDivBy = Number(lines[3].match(/\d+/)[0]);
    const throwTo = new Map([
      [true, Number(lines[4].match(/\d+/)[0])],
      [false, Number(lines[5].match(/\d+/)[0])],
    ]);
    return { items, operation, testDivBy, throwTo, inspections: 0 };
  });
}

function round(monkeys: Monkey[], reduce: (w: number) => number) {
  for (const m of monkeys) {
    while (m.items.length) {
      let worry = m.items.shift();
      const op = m.operation[0];
      const operand = m.operation[1] === 'old' ? worry : Number(m.operation[1]);
      worry = op === '+' ? worry + operand : worry * operand;
      worry = reduce(worry);
      const target = m.throwTo.get(worry % m.testDivBy === 0);
      m.inspections++;
      monkeys[target].items.push(worry);
    }
  }
}

function monkeyBusiness(monkeys: Monkey[], part: 1 | 2) {
  monkeys = monkeys.map((m) => ({ ...m, items: m.items.slice() })); // clone for part 2
  const lcm = product(monkeys.map((m) => m.testDivBy));
  const rounds = part === 1 ? 20 : 10000;
  const reduce: (w: number) => number =
    part === 1 ? (w) => Math.floor(w / 3) : (w) => w % lcm;
  for (let i = 0; i < rounds; ++i) round(monkeys, reduce);
  return product(
    monkeys
      .map((m) => m.inspections)
      .sort((a, b) => b - a)
      .slice(0, 2)
  );
}

const exampleData = parse(load('ex').paragraphs);
example.equal(monkeyBusiness(exampleData, 1), 10605);
example.equal(monkeyBusiness(exampleData, 2), 2713310158);

const data = parse(load().paragraphs);
export default solve(
  () => monkeyBusiness(data, 1),
  () => monkeyBusiness(data, 2)
).expect(108240, 25712998901);
