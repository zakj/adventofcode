import { main } from 'lib/advent';
import { lines, sum } from 'lib/util';

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

main(
  (s) => sum(lines(s).map(part1)),
  (s) => sum(lines(s).map(part2))
);
