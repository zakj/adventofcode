import { main } from 'lib/advent';
import { sum } from 'lib/util';

type Token = {
  type: 'group' | 'garbage' | 'escape' | 'literal';
  children: Token[];
  length: number;
};

const Nothing = Symbol('Nothing');
type Maybe<T> = T | typeof Nothing;

const literalToken = (literal: string): Token => ({
  type: 'literal',
  children: [],
  length: literal.length,
});

function scanEscape(s: string): Maybe<Token> {
  if (s[0] !== '!') return Nothing;
  return { type: 'escape', children: [], length: 2 };
}

function scanGarbage(start: string): Maybe<Token> {
  if (start[0] !== '<') return Nothing;
  let length = 1;
  const children = [];
  let literal = '';

  for (;;) {
    const s = start.slice(length);
    const result = scanEscape(s);
    if (result === Nothing) {
      length += 1;
      if (s[0] === '>') break;
      literal += s[0];
    } else {
      if (literal.length) {
        children.push(literalToken(literal));
        literal = '';
      }
      children.push(result);
      length += result.length;
    }
  }
  if (literal.length) children.push(literalToken(literal));
  return { type: 'garbage', children, length };
}

function scanGroup(start: string): Maybe<Token> {
  if (start[0] !== '{') return Nothing;
  let length = 1;
  const children = [];
  let literal = '';

  for (;;) {
    const s = start.slice(length);
    let result = scanGroup(s);
    if (result === Nothing) result = scanGarbage(s);
    if (result === Nothing) {
      length += 1;
      if (s[0] === '}') break;
      literal += s[0];
    } else {
      if (literal.length) {
        children.push(literalToken(literal));
        literal = '';
      }
      children.push(result);
      length += result.length;
    }
  }

  if (literal.length) children.push(literalToken(literal));
  return { type: 'group', children, length };
}

function score(token: Token, depth = 1): number {
  return (
    (token.type === 'group' ? depth : 0) +
    sum(token.children.map((child) => score(child, depth + 1)))
  );
}

function countGarbageLiterals(token: Token, insideGarbage = false): number {
  if (token.type === 'literal' && insideGarbage) return token.length;
  return sum(
    token.children.map((child) =>
      countGarbageLiterals(child, insideGarbage || token.type === 'garbage')
    )
  );
}

function tokenize(s: string): Token {
  const result = scanGroup(s);
  if (result === Nothing) throw new Error();
  return result;
}

main(
  (s) => score(tokenize(s)),
  (s) => countGarbageLiterals(tokenize(s))
);
