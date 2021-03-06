import { answers, example, load } from '../advent';
import { sum } from '../util';

const parse = (s: string): number[] => s.trim().split('').map(Number);

function pattern(index: number): number[] {
  const base = [0, 1, 0, -1];
  const pattern = [];
  for (let i = 0; i < base.length; ++i) {
    for (let j = 0; j < index + 1; ++j) {
      pattern.push(base[i]);
    }
  }
  pattern.push(pattern.shift());
  return pattern;
}

function fft(digits: number[], rounds: number): string {
  for (let round = 0; round < rounds; ++round) {
    digits = digits.map((_, i) => {
      const pat = pattern(i);
      return Math.abs(sum(digits.map((d, j) => d * pat[j % pat.length]))) % 10;
    });
  }
  return digits.slice(0, 8).join('');
}

function fftOffset(digits: number[], rounds: number, offset: number): string {
  // For offsets greater than halfway through digits, pattern to the left of
  // offset is 0 and to the right is 1, so we can make some significant
  // shortcuts...
  if (offset < digits.length / 2) throw new Error();
  for (let round = 0; round < rounds; ++round) {
    let overallSum = sum(digits.slice(offset));
    for (let i = offset; i < digits.length; ++i) {
      [overallSum, digits[i]] = [overallSum - digits[i], overallSum % 10];
    }
  }
  return digits.slice(offset, offset + 8).join('');
}

const examples: [string, string][] = [
  ['80871224585914546619083218645595', '24176176'],
  ['19617804207202209144916044189917', '73745418'],
  ['69317163492948606335995924319873', '52432133'],
];
for (const [inp, exp] of examples) {
  example.equal(fft(parse(inp), 100), exp);
}

const digits = parse(load(16).raw);
answers.expect('30369587', '27683551');
answers(
  // TODO optimize? 1.5s
  () => fft(digits, 100),
  () => {
    // TODO optimize? .flat takes ~1s
    const extendedDigits = new Array(10000).fill(digits).flat();
    const n = Number(digits.slice(0, 7).join(''));
    return fftOffset(extendedDigits, 100, n);
  }
);
