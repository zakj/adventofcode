import { example, load, solve } from 'lib/advent';

const CONTINUE = Symbol('continue');

function parse(paras: string[][]) {
  return paras.map((lines) => {
    return lines.map((line) => JSON.parse(line));
  });
}

const exampleData = parse(load('ex').paragraphs);
example.equal(13, part1(exampleData));
example.equal(140, part2(exampleData));

function isRightOrder(left, right) {
  if (typeof left === 'number' && typeof right === 'number') {
    if (left < right) return true;
    if (left > right) return false;
    return CONTINUE;
  } else {
    if (!Array.isArray(left)) left = [left];
    if (!Array.isArray(right)) right = [right];
    const length = Math.max(left.length, right.length);
    for (let i = 0; i < length; ++i) {
      const [l, r] = [left[i], right[i]];
      if (l === undefined) return true;
      if (r === undefined) return false;
      const result = isRightOrder(left[i], right[i]);
      if (result === CONTINUE) continue;
      return result;
    }
  }
  return CONTINUE;
}

function part1(pairs) {
  let sum = 0;
  for (let i = 0; i < pairs.length; ++i) {
    const [left, right] = pairs[i];
    const r = isRightOrder(left, right);
    if (r) sum += i + 1;
  }
  return sum;
}

function part2(pairs) {
  const dividerA = [[2]];
  const dividerB = [[6]];
  const packets = pairs.flat(1);
  packets.push(dividerA, dividerB);
  packets.sort((a, b) => (isRightOrder(a, b) ? -1 : 1));
  const ai = packets.findIndex((x) => x === dividerA) + 1;
  const bi = packets.findIndex((x) => x === dividerB) + 1;
  return ai * bi;
}

const data = parse(load().paragraphs);
export default solve(
  () => part1(data),
  () => part2(data)
).expect(5503, 20952);
