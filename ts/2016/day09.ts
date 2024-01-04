import { main } from 'lib/advent';
import { lines } from 'lib/util';

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

main(
  (s) => decompress(lines(s).join('')).length,
  (s) => decompressV2Length(lines(s).join(''))
);
