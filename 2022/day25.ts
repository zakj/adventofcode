import { example, load, solve } from 'lib/advent';
import { sum } from 'lib/util';

const snafu = {
  '2': 2,
  '1': 1,
  '0': 0,
  '-': -1,
  '=': -2,
};

function snafuToInt(s: string): number {
  const digits = s.split('').reverse();
  return sum(digits.map((d, i) => snafu[d] * Math.pow(5, i)));
}

function itos(n: number): string[] {
  if (n === 0) return [];
  if (n % 5 === 0) return ['0'].concat(...itos(Math.floor(n / 5)));
  if (n % 5 === 1) return ['1'].concat(...itos(Math.floor(n / 5)));
  if (n % 5 === 2) return ['2'].concat(...itos(Math.floor(n / 5)));
  if (n % 5 === 3) return ['='].concat(...itos(Math.floor((n + 2) / 5)));
  if (n % 5 === 4) return ['-'].concat(...itos(Math.floor((n + 1) / 5)));
  return [];
}

function intToSnafu(n: number): string {
  return itos(n).reverse().join('') || '0';
}

example.equal(snafuToInt('1'), 1);
example.equal(snafuToInt('1='), 3);
example.equal(snafuToInt('1=11-2'), 2022);
example.equal(snafuToInt('1-0---0'), 12345);
example.equal(snafuToInt('1121-1110-1=0'), 314159265);

example.equal(intToSnafu(0), '0');
example.equal(intToSnafu(1), '1');
example.equal(intToSnafu(3), '1=');
example.equal(intToSnafu(2022), '1=11-2');
example.equal(intToSnafu(12345), '1-0---0');
example.equal(intToSnafu(314159265), '1121-1110-1=0');

const data = load().lines;
export default solve(() => intToSnafu(sum(data.map(snafuToInt)))).expect(
  '2-2=21=0021=-02-1=-0'
);
