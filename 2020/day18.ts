import { answers, example, loadDayLines, sum } from './util';

const isDigit = (c: string): boolean => /\d/.test(c);
const isOperator = (c: string): boolean => ['+', '*'].includes(c);

function evaluate(s: string): number {
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

  let result = stack.shift();
  for (let i = 0; i < stack.length; i += 2) {
    const op = stack[i];
    const val = stack[i + 1];
    if (op === '+') result += val;
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

const expressions = loadDayLines(18);
answers(() => sum(expressions.map(evaluate)));
