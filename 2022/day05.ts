import { example, load, solve } from 'lib/advent';

type Stacks = Record<number, string[]>;
type Procedure = { from: number; to: number; count: number };

function parse(paragraphs: string[][]): [Stacks, Procedure[]] {
  const stacksInput = paragraphs[0];
  const indexToStack = new Map(
    stacksInput[stacksInput.length - 1].split('').map((x, i) => [i, Number(x)])
  );
  const stacks: Record<number, string[]> = {};
  stacksInput.slice(0, stacksInput.length - 1).forEach((line) => {
    line.split('').forEach((x, i) => {
      if (!/[A-Z]/.test(x)) return;
      const stack = indexToStack.get(i);
      if (!stacks[stack]) stacks[stack] = [];
      stacks[stack].unshift(x);
    });
  });

  const procedures = paragraphs[1].map((line) => {
    const [count, from, to] = line.match(/[0-9]+/g).map(Number);
    return { count, from, to };
  });

  return [stacks, procedures];
}

// Needed because we mutate stacks and don't want to break part 2.
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

function operate(stacks: Stacks, procedures: Procedure[], reverse = true) {
  stacks = procedures.reduce((stacks, p) => {
    const move = stacks[p.from].splice(-p.count, p.count);
    stacks[p.to].push(...(reverse ? move.reverse() : move));
    return stacks;
  }, clone(stacks));
  return Object.values(stacks)
    .map((stack) => stack.pop())
    .join('');
}

const exampleData = parse(load('ex').paragraphs);
example.equal('CMZ', operate(...exampleData));
example.equal('MCD', operate(...exampleData, false));

const data = parse(load().paragraphs);
export default solve(
  () => operate(...data),
  () => operate(...data, false)
).expect('VGBBJCRMN', 'LBBVJBRMH');
