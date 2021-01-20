import { answers, example } from './advent';
import { chunks } from './util';

function curve(a: string): string {
  const b = [...a]
    .reverse()
    .map((c) => (c === '0' ? '1' : '0'))
    .join('');
  return `${a}0${b}`;
}

function checksum(s: string): string {
  let checksum = [...s];
  do {
    checksum = chunks(checksum, 2).map(([a, b]) => (a === b ? '1' : '0'));
  } while (checksum.length % 2 === 0);
  return checksum.join('');
}

function checksumForDisk(contents: string, size: number): string {
  while (contents.length < size) {
    contents = curve(contents);
  }
  return checksum(contents.slice(0, size));
}

example.equal(curve('111100001010'), '1111000010100101011110000');
example.equal(checksumForDisk('10000', 20), '01100');

const input = '01111010110010011';
answers(
  () => checksumForDisk(input, 272),
  () => checksumForDisk(input, 35651584)
);
