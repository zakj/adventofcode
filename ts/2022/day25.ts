import { main } from 'lib/advent';
import { lines, sum } from 'lib/util';

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

main((s) => intToSnafu(sum(lines(s).map(snafuToInt))));
