import { chunks, range, rotate } from 'lib/util';

export function round(list: number[], lengths: number[], ptr = 0, skip = 0) {
  for (const length of lengths) {
    const rotated = rotate(list, ptr);
    const subset = rotated.slice(0, length).reverse();
    rotated.splice(0, length, ...subset);
    list = rotate(rotated, ptr * -1);
    ptr += length + skip;
    skip++;
  }
  return { list, ptr, skip };
}

export function knotHash(s: string): string {
  const lengths = [].concat(
    s.split('').map((x) => x.charCodeAt(0)),
    [17, 31, 73, 47, 23]
  );
  let list = range(0, 256);
  let ptr = 0;
  let skip = 0;
  for (let i = 0; i < 64; ++i) {
    ({ list, ptr, skip } = round(list, lengths, ptr, skip));
  }
  return chunks(list, 16)
    .map((chunk) => chunk.reduce((acc, n) => acc ^ n))
    .map((hash) => `0${hash.toString(16)}`.slice(-2))
    .join('');
}
