import { iter } from 'lib/iter';
import { example, load, solve } from '../advent';

function curve(a: number[]): number[] {
  const b = [...a].reverse().map((c) => (c === 0 ? 1 : 0));
  return a.concat([0], b);
}

function checksum(value: number[]): number[] {
  let checksum = value;
  do {
    checksum = iter(checksum)
      .splitEvery(2)
      .map(([a, b]) => (a === b ? 1 : 0))
      .toArray();
  } while (checksum.length % 2 === 0);
  return checksum;
}

function checksumForDisk(contents: number[], size: number): string {
  while (contents.length < size) {
    contents = curve(contents);
  }
  return checksum(contents.slice(0, size)).join('');
}

const parse = (s: string): number[] => s.split('').map(Number);
example.equal(
  curve(parse('111100001010')).join(''),
  '1111000010100101011110000'
);
example.equal(checksumForDisk(parse('10000'), 20), '01100');

const input = parse(load().raw.trim());
export default solve(
  () => checksumForDisk(input, 272),
  () => checksumForDisk(input, 35651584)
).expect('00100111000101111', '11101110011100110');
