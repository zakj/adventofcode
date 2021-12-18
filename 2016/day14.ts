import { answers, example, load } from '../advent';
import { md5 } from '../util';

type Hasher<T, U> = (key: T) => U;

function stretchedMd5(key: string): string {
  let hash = md5(key);
  for (let i = 0; i < 2016; ++i) {
    hash = md5(hash);
  }
  return hash;
}

function memoized<K, V>(key: K, cache: Map<K, V>, hasher: Hasher<K, V>): V {
  if (!cache.get(key)) cache.set(key, hasher(key));
  return cache.get(key);
}

function indexOfNthKey(
  salt: string,
  n: number,
  hasher: Hasher<string, string>
): number {
  const md5Cache = new Map<string, string>();
  const keys = new Map<number, string>();
  const re3 = /(?:(.)\1\1)/;
  for (let i = 0; keys.size < 64; ++i) {
    const hash = memoized(`${salt}${i}`, md5Cache, hasher);
    const match = hash.match(re3);
    if (match) {
      const c = match[1];
      const re5 = new RegExp(`${c}${c}${c}${c}${c}`);
      for (let j = i + 1; j <= i + 1000; ++j) {
        const checkHash = memoized(`${salt}${j}`, md5Cache, hasher);
        if (checkHash.match(re5)) {
          keys.set(i, hash);
          break;
        }
      }
    }
  }
  return Math.max(...keys.keys());
}

const exampleSalt = 'abc';
example.equal(indexOfNthKey(exampleSalt, 64, md5), 22728);

const salt = load(14).raw.trim();
answers.expect(18626, 20092);
answers(
  () => indexOfNthKey(salt, 64, md5),
  () => indexOfNthKey(salt, 64, stretchedMd5)
);
