import { answers, example, loadDayLines, sum } from './util';

const isDigit = (c: string): boolean => /\d/.test(c);
const isOperator = (c: string): boolean => ['+', '*'].includes(c);

type Token = number | '*' | '+' | Token[];

function tokenize(s: string): Token[] {
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
        stack.push(tokenize(buffer));
        buffer = '';
      }
    }
  });
  if (buffer) stack.push(Number(buffer));

  return stack;
}

function evaluate(tokens: Token[], priorityOperator?: '+' | '*'): number {
  tokens = tokens.map(t => Array.isArray(t) ? evaluate(t, priorityOperator) : t);

  if (priorityOperator) {
    let i: number;
    while ((i = tokens.findIndex((x) => x === priorityOperator)) !== -1) {
      const a = tokens[i - 1] as number
      const b = tokens[i + 1] as number
      tokens.splice(i - 1, 3, priorityOperator === "+" ? a + b : a * b)
    }
  }

  let result = tokens.shift() as number;
  for (let i = 0; i < tokens.length; i += 2) {
    const op = tokens[i];
    const val = tokens[i + 1] as number;
    if (op === '+') result += val;
    if (op === '*') result *= val;
  }
  return result;
}

const part1 = (s: string): number => evaluate(tokenize(s));
const part2 = (s: string): number => evaluate(tokenize(s), '+');

example.equal(part1('2 * 3 + (4 * 5)'), 26);
example.equal(part1('5 + (8 * 3 + 9 + 3 * 4 * 3)'), 437);
example.equal(part1('5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))'), 12240);
example.equal(
  part1('((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2'),
  13632
);

example.equal(part2('1 + (2 * 3) + (4 * (5 + 6))'), 51)
example.equal(part2('2 * 3 + (4 * 5)'), 46)
example.equal(part2('5 + (8 * 3 + 9 + 3 * 4 * 3)'), 1445)
example.equal(part2('5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))'), 669060)
example.equal(part2('((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2'), 23340)

const expressions = loadDayLines(18);
answers(
  () => sum(expressions.map(part1)),
  () => sum(expressions.map(part2)),
);
