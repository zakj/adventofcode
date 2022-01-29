import { example, load, solve } from 'lib/advent';
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

  while (true) {
    const s = start.slice(length);
    let result = scanEscape(s);
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

  while (true) {
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

function score(token: Token, depth: number = 1): number {
  return (
    (token.type === 'group' ? depth : 0) +
    sum(token.children.map((child) => score(child, depth + 1)))
  );
}

function countGarbageLiterals(
  token: Token,
  insideGarbage: boolean = false
): number {
  let count = 0;
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

example.equal(score(tokenize('{}')), 1);
example.equal(score(tokenize('{{{}}}')), 6);
example.equal(score(tokenize('{{},{}}')), 5);
example.equal(score(tokenize('{{{},{},{{}}}}')), 16);
example.equal(score(tokenize('{<a>,<a>,<a>,<a>}')), 1);
example.equal(score(tokenize('{{<ab>},{<ab>},{<ab>},{<ab>}}')), 9);
example.equal(score(tokenize('{{<!!>},{<!!>},{<!!>},{<!!>}}')), 9);
example.equal(score(tokenize('{{<a!>},{<a!>},{<a!>},{<ab>}}')), 3);

example.equal(countGarbageLiterals(tokenize('{<>}')), 0);
example.equal(countGarbageLiterals(tokenize('{<random characters>}')), 17);
example.equal(countGarbageLiterals(tokenize('{<<<<>}')), 3);
example.equal(countGarbageLiterals(tokenize('{<{!>}>}')), 2);
example.equal(countGarbageLiterals(tokenize('{<!!>}')), 0);

const ast = tokenize(load().raw);
export default solve(
  () => score(ast),
  () => countGarbageLiterals(ast)
).expect(10820, 5547);
