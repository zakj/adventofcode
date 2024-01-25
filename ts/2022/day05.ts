import { main } from 'lib/advent';
import { paragraphs } from 'lib/util';

type Stacks = Record<number, string[]>;
type Procedure = { from: number; to: number; count: number };

function parse(paragraphs: string[][]): [Stacks, Procedure[]] {
  const indexToStack = new Map(
    paragraphs[0]
      .pop()
      .split('')
      .map((x, i) => [i, Number(x)])
  );
  const stacks = paragraphs[0].reduce((stacks, line) => {
    line.split('').forEach((x, i) => {
      if (!/[A-Z]/.test(x)) return;
      (stacks[indexToStack.get(i)] ??= []).unshift(x);
    });
    return stacks;
  }, {});

  const procedures = paragraphs[1].map((line) => {
    const [count, from, to] = line.match(/[0-9]+/g).map(Number);
    return { count, from, to };
  });

  return [stacks, procedures];
}

function operate(stacks: Stacks, procedures: Procedure[], reverse = true) {
  stacks = procedures.reduce((stacks, p) => {
    const move = stacks[p.from].splice(-p.count, p.count);
    stacks[p.to].push(...(reverse ? move.reverse() : move));
    return stacks;
  }, stacks);
  return Object.values(stacks)
    .map((stack) => stack.pop())
    .join('');
}

main(
  (s) => operate(...parse(paragraphs(s))),
  (s) => operate(...parse(paragraphs(s)), false)
);
