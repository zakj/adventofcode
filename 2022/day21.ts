import { example, load, solve } from 'lib/advent';

function parse(lines: string[]) {
  return new Map<string, string | number>(
    lines.map((line) => {
      const [name, expr] = line.split(': ');
      return [name, isNaN(+expr) ? expr : Number(expr)];
    })
  );
}

const ops: Record<string, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
};

function resolveMonkey(
  monkeys: Map<string, string | number>,
  start = 'root'
): number {
  const val = monkeys.get(start);
  if (typeof val === 'number') return val;
  const [a, opStr, b] = val.split(' ');
  const op = ops[opStr];
  return op(resolveMonkey(monkeys, a), resolveMonkey(monkeys, b));
}

function makeString(
  monkeys: Map<string, string | number>,
  name: string
): string {
  if (name === 'humn') return name;
  const val = monkeys.get(name);
  if (typeof val === 'number') return val.toString();

  const [a, opStr, b] = val.split(' ');
  const aVal = makeString(monkeys, a);
  const bVal = makeString(monkeys, b);
  if (!isNaN(+aVal) && !isNaN(+bVal)) {
    return ops[opStr](Number(aVal), Number(bVal)).toString();
  }
  return `(${aVal} ${opStr} ${bVal})`;
}

function part2(monkeys: Map<string, string | number>, start = 'root'): number {
  const val = monkeys.get(start);
  if (typeof val === 'number') throw new Error();
  const [targetA, , targetB] = val.split(' ');

  let test = makeString(monkeys, targetA);
  let goal = makeString(monkeys, targetB);
  if (isNaN(+goal)) [test, goal] = [goal, test];
  const goalVal = Number(eval(goal));

  let lowBound = Number.MIN_SAFE_INTEGER;
  let highBound = Number.MAX_SAFE_INTEGER;

  const checkPos = eval(test.replace('humn', '1'));
  const checkNeg = eval(test.replace('humn', '-1'));
  const invert = checkPos < checkNeg;
  const isTooHigh = (check: number): boolean =>
    invert ? check < goalVal : check > goalVal;
  console.log({ test, goal });
  for (;;) {
    const humn = Math.floor((highBound + lowBound) / 2);
    const check = eval(test);
    if (check === goalVal) return humn;
    if (isTooHigh(check)) highBound = humn;
    else lowBound = humn;
    if (lowBound >= highBound) throw new Error();
  }

  return 0;
}

const exampleData = parse([
  'root: pppw + sjmn',
  'dbpl: 5',
  'cczh: sllz + lgvd',
  'zczc: 2',
  'ptdq: humn - dvpt',
  'dvpt: 3',
  'lfqf: 4',
  'humn: 5',
  'ljgn: 2',
  'sjmn: drzm * dbpl',
  'sllz: 4',
  'pppw: cczh / lfqf',
  'lgvd: ljgn * ptdq',
  'drzm: hmdt - zczc',
  'hmdt: 32',
]);
example.equal(resolveMonkey(exampleData), 152);
example.equal(part2(exampleData), 301);

const data = parse(load().lines);
export default solve(
  () => resolveMonkey(data),
  () => part2(data)
).expect(104272990112064, 3220993874133);
