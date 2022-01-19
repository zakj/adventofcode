import { load, solve } from '../advent';
import { range } from '../util';

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

const input = load().lines[0].split('').map(Number);
export default solve(
  () => range(0, 40).reduce(lookAndSay, input).length,
  () => range(0, 50).reduce(lookAndSay, input).length
).expect(329356, 4666278);
