import { main } from 'lib/advent';
import { range } from 'lib/util';

function lookAndSay(s: number[]) {
  const out = [];
  let lastValue = s[0];
  let count = 1;
  for (let i = 1; i < s.length; ++i) {
    if (s[i] === lastValue) ++count;
    else {
      out.push(count);
      out.push(lastValue);
      count = 1;
      lastValue = s[i];
    }
  }
  out.push(count);
  out.push(lastValue);
  return out;
}

function parse(s: string): number[] {
  return s.trim().split('').map(Number);
}

main(
  (s) => range(0, 40).reduce(lookAndSay, parse(s)).length,
  (s) => range(0, 50).reduce(lookAndSay, parse(s)).length
);
