import { load, solve } from '../advent';
import { pairs } from '../util';

const A = 'a'.charCodeAt(0);
const Z = 'z'.charCodeAt(0);

function incrementPass(pass: string[]): string[] {
  const last = pass.pop().charCodeAt(0) + 1;
  if (last > Z) pass = incrementPass(pass);
  return [...pass, String.fromCharCode(((last - A) % (Z - A + 1)) + A)];
}

function increasingStraight(pass: string): boolean {
  const deltas = pairs(pass.split('').map((c) => c.charCodeAt(0))).map(
    ([a, b]) => b - a
  );
  return pairs(deltas).some(([a, b]) => a === 1 && b === 1);
}

const badLetters = /[iol]/;
const twoPairs = /(.)\1.*(.)\2/;

// TODO: `find` for iterable/generator?
const password = load().lines[0];
export default solve(
  () => {
    let pass = password;
    while (true) {
      pass = incrementPass(pass.split('')).join('');
      if (
        increasingStraight(pass) &&
        !badLetters.test(pass) &&
        twoPairs.test(pass)
      )
        return pass;
    }
  },
  (part1) => {
    let pass = part1;
    while (true) {
      pass = incrementPass(pass.split('')).join('');
      if (
        increasingStraight(pass) &&
        !badLetters.test(pass) &&
        twoPairs.test(pass)
      )
        return pass;
    }
  }
).expect('hepxxyzz', 'heqaabcc');
