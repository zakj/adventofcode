import { main } from 'lib/advent';

function curve(a: number[]): number[] {
  const b = [...a].reverse().map((c) => (c === 0 ? 1 : 0));
  return a.concat([0], b);
}

function checksum(value: number[]): number[] {
  let checksum = value;
  do {
    const next = [];
    for (let i = 0; i < checksum.length; i += 2) {
      next.push(checksum[i] === checksum[i + 1] ? 1 : 0);
    }
    checksum = next;
  } while (checksum.length % 2 === 0);
  return checksum;
}

function checksumForDisk(contents: number[], size: number): string {
  while (contents.length < size) {
    contents = curve(contents);
  }
  return checksum(contents.slice(0, size)).join('');
}

const parse = (s: string): number[] => s.trim().split('').map(Number);

main(
  (s) => checksumForDisk(parse(s), 272),
  (s) => checksumForDisk(parse(s), 35651584)
);
