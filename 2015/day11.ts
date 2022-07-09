import { load, solve } from 'lib/advent';
import { iter } from 'lib/iter';
import { pairs } from 'lib/util';

const A = 'a'.charCodeAt(0);
const Z = 'z'.charCodeAt(0);

function* genPass(start: string): Generator<string> {
  let pass = start.split('');
  const rotateChar = (c: number): string =>
    String.fromCharCode(((c - A) % (Z - A + 1)) + A);
  while (true) {
    for (let i = pass.length - 1; i >= 0; --i) {
      pass[i] = rotateChar(pass[i].charCodeAt(0) + 1);
      if (pass[i] !== 'a') break;
    }
    yield pass.join('');
  }
}

function increasingStraight(pass: string): boolean {
  const deltas = pairs(pass.split('').map((c) => c.charCodeAt(0))).map(
    ([a, b]) => b - a
  );
  return pairs(deltas).some(([a, b]) => a === 1 && b === 1);
}

const badLetters = /[iol]/;
const twoPairs = /(.)\1.*(.)\2/;

const isValidPass = (p: string): boolean =>
  increasingStraight(p) && !badLetters.test(p) && twoPairs.test(p);

const password = load().lines[0];
export default solve(
  () => iter(genPass(password)).find(isValidPass),
  (part1) => iter(genPass(part1)).find(isValidPass)
).expect('hepxxyzz', 'heqaabcc');
