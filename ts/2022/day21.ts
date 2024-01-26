import { main } from 'lib/advent';
import { lines } from 'lib/util';

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

// TODO: clean up
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

  // TODO: reuse part1 instead of eval?
  const checkPos = eval(test.replace('humn', '1'));
  const checkNeg = eval(test.replace('humn', '-1'));
  const invert = checkPos < checkNeg;
  const isTooHigh = (check: number): boolean =>
    invert ? check < goalVal : check > goalVal;
  for (;;) {
    const humn = Math.floor((highBound + lowBound) / 2);
    const check = eval(test);
    if (check === goalVal) return humn;
    if (isTooHigh(check)) highBound = humn;
    else lowBound = humn;
  }

  return 0;
}

main(
  (s) => resolveMonkey(parse(lines(s))),
  (s) => part2(parse(lines(s)))
);
