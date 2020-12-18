import { answers, example, loadDayLines, sum } from './util';

const isDigit = (c: string): boolean => /\d/.test(c);
const isOperator = (c: string): boolean => ['+', '*'].includes(c);

type Token = number | '*' | '+' | Token[];

function tokenize(s: string, evaluate: (s: string) => number): Token[] {
  let buffer = '';
  let openParens = 0;
  let stack = [];

  [...s.replaceAll(/\s+/g, '')].forEach((c) => {
    if (isDigit(c)) {
      buffer += c;
    } else if (!openParens && buffer) {
      stack.push(Number(buffer));
      buffer = '';
    }

    if (isOperator(c)) {
      if (openParens) buffer += c;
      else stack.push(c);
    }

    if (c === '(') {
      if (openParens) buffer += c;
      openParens++;
    }

    if (c === ')') {
      openParens--;
      if (openParens) {
        buffer += c;
      } else {
        stack.push(evaluate(buffer));
        buffer = '';
      }
    }
  });
  if (buffer) stack.push(Number(buffer));

  return stack;
}

function evaluate(s: string): number {
  let stack = tokenize(s, evaluate);
  let result = stack.shift() as number;
  for (let i = 0; i < stack.length; i += 2) {
    const op = stack[i];
    const val = stack[i + 1] as number;
    if (op === '+') result += val;
    if (op === '*') result *= val;
  }

  return result;
}

function evaluatePrecedence(s: string): number {
  let stack = tokenize(s, evaluatePrecedence);

  let i;
  while ((i = stack.findIndex(x => x === '+')) !== -1) {
    const sum = (stack[i - 1] as number) + (stack[i + 1] as number);
    stack = [].concat(stack.slice(0, i - 1), sum, stack.slice(i + 2))
  }

  let result = stack.shift() as number;
  for (let i = 0; i < stack.length; i += 2) {
    const op = stack[i];
    const val = stack[i + 1] as number;
    if (op === '*') result *= val;
  }
  return result;
}

example.equal(evaluate('2 * 3 + (4 * 5)'), 26);
example.equal(evaluate('5 + (8 * 3 + 9 + 3 * 4 * 3)'), 437);
example.equal(evaluate('5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))'), 12240);
example.equal(
  evaluate('((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2'),
  13632
);

example.equal(evaluatePrecedence('1 + (2 * 3) + (4 * (5 + 6))'), 51)
example.equal(evaluatePrecedence('2 * 3 + (4 * 5)'), 46)
example.equal(evaluatePrecedence('5 + (8 * 3 + 9 + 3 * 4 * 3)'), 1445)
example.equal(evaluatePrecedence('5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))'), 669060)
example.equal(evaluatePrecedence('((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2'), 23340)


const expressions = loadDayLines(18);
answers(
  () => sum(expressions.map(evaluate)),
  () => sum(expressions.map(evaluatePrecedence)),
);
