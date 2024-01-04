import { main } from 'lib/advent';
import { md5 } from 'lib/util';

type Hasher<T, U> = (key: T) => U;

function stretchedMd5(key: string): string {
  let hash = md5(key);
  for (let i = 0; i < 2016; ++i) {
    hash = md5(hash);
  }
  return hash;
}

function indexOfNthKey(
  salt: string,
  n: number,
  hasher: Hasher<string, string>
): number {
  const keys = new Map<number, string>();
  const re3 = /(?:(.)\1\1)/;
  const md5Buffer = new Array(1000);
  for (let i = 0; i < 1000; ++i) {
    md5Buffer[i] = hasher(`${salt}${i}`);
  }

  for (let i = 0; keys.size < 64; ++i) {
    const hash = md5Buffer.shift();
    md5Buffer.push(hasher(`${salt}${i + 1000}`));
    const match = hash.match(re3);
    if (match) {
      const c = match[1].repeat(5);
      if (md5Buffer.some((h) => h.includes(c))) keys.set(i, hash);
    }
  }

  return Math.max(...keys.keys());
}

main(
  (s) => indexOfNthKey(s.trim(), 64, md5),
  (s) => indexOfNthKey(s.trim(), 64, stretchedMd5)
);
