import { example, load, solve } from 'lib/advent';

function decompress(s: string): string {
  const output = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '(') {
      const chunk = repeatChunk(s.slice(i));
      output.push(chunk.repeat.repeat(chunk.count));
      i += chunk.offset;
    } else {
      output.push(c);
      ++i;
    }
  }
  return output.join('');
}

function repeatChunk(s: string): {
  repeat: string;
  count: number;
  offset: number;
} {
  if (s[0] !== '(') throw new Error();
  const closeIndex = s.split('').findIndex((v) => v === ')');
  const marker = s.slice(1, closeIndex).split('x');
  const [chars, count] = [Number(marker[0]), Number(marker[1])];
  const offset = closeIndex + 1 + chars;
  const repeat = s.slice(closeIndex + 1, offset);
  return { repeat, count, offset };
}

function decompressV2Length(s: string): number {
  const firstParen = s.split('').findIndex((c) => c === '(');
  if (firstParen === -1) return s.length;
  const prefixLength = firstParen;
  const chunk = repeatChunk(s.slice(firstParen));
  return (
    prefixLength +
    decompressV2Length(chunk.repeat) * chunk.count +
    decompressV2Length(s.slice(prefixLength + chunk.offset))
  );
}

example.equal(decompress('ADVENT'), 'ADVENT');
example.equal(decompress('A(1x5)BC'), 'ABBBBBC');
example.equal(decompress('(3x3)XYZ'), 'XYZXYZXYZ');
example.equal(decompress('A(2x2)BCD(2x2)EFG'), 'ABCBCDEFEFG');
example.equal(decompress('(6x1)(1x3)A'), '(1x3)A');
example.equal(decompress('X(8x2)(3x3)ABCY'), 'X(3x3)ABC(3x3)ABCY');

example.equal(decompressV2Length('X(8x2)(3x3)ABCY'), 20);
example.equal(
  decompressV2Length(
    '(25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN'
  ),
  445
);

const compressed = load().lines.join('');
export default solve(
  () => decompress(compressed).length,
  () => decompressV2Length(compressed)
).expect(107035, 11451628995);
