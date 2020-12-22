import { answers, example, loadDayLines, sum } from './util';

type Operator = '*' | '+';
type Token = number | Operator;

const isDigit = (s: string): boolean => /^\d$/.test(s);
const isOperator = (s: string): s is Operator => ['+', '*'].includes(s);

function shuntingYard(s: string, precedence = { '*': 0, '+': 0 }): Token[] {
  const output: Token[] = [];
  const opStack: (Operator | '(')[] = [];
  s.match(/(\d+|[*+()])/g).forEach((token) => {
    if (isDigit(token)) {
      output.push(Number(token));
    } else if (isOperator(token)) {
      while (
        opStack.length &&
        isOperator(opStack[opStack.length - 1]) &&
        precedence[opStack[opStack.length - 1]] >= precedence[token]
      ) {
        output.push(opStack.pop() as Operator);
      }
      opStack.push(token);
    } else if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      let op: Operator | '(';
      while ((op = opStack.pop()) !== '(') output.push(op);
      if (op !== '(') throw new Error('mismatched parens');
    }
  });
  while (opStack.length) output.push(opStack.pop() as Operator);
  return output;
}

function rpn(tokens: Token[]): number {
  const stack: number[] = [];
  while (tokens.length > 0) {
    const t = tokens.shift();
    if (typeof t === 'number') {
      stack.push(t);
    } else {
      const [b, a] = [stack.pop(), stack.pop()];
      if (t === '+') stack.push(a + b);
      if (t === '*') stack.push(a * b);
    }
  }
  if (stack.length !== 1) throw new Error();
  return stack.pop();
}

const part1 = (s: string): number => rpn(shuntingYard(s));
const part2 = (s: string): number => rpn(shuntingYard(s, { '+': 1, '*': 0 }));

example.equal(part1('2 * 3 + (4 * 5)'), 26);
example.equal(part1('5 + (8 * 3 + 9 + 3 * 4 * 3)'), 437);
example.equal(part1('5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))'), 12240);
example.equal(part1('((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2'), 13632);

example.equal(part2('1 + (2 * 3) + (4 * (5 + 6))'), 51);
example.equal(part2('2 * 3 + (4 * 5)'), 46);
example.equal(part2('5 + (8 * 3 + 9 + 3 * 4 * 3)'), 1445);
example.equal(part2('5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))'), 669060);
example.equal(part2('((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2'), 23340);

const expressions = loadDayLines(18);
answers(
  () => sum(expressions.map(part1)),
  () => sum(expressions.map(part2))
);
