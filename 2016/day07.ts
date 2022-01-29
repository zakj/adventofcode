import { example, load, solve } from 'lib/advent';
import { Iter, iter } from 'lib/iter';

const isAbba = (s: string): boolean => /(.)(?!\1)(.)\2\1/.test(s);

function debracket(s: string): {
  bracketed: Iter<string>;
  unbracketed: Iter<string>;
} {
  if (s[0] === '[') throw new Error();
  const [unbracketed, bracketed] = iter(s.split(/[\[\]]/)).partition(
    (_, i) => i % 2 === 0
  );
  return { bracketed, unbracketed };
}

function supportsTls(s: string): boolean {
  const { bracketed, unbracketed } = debracket(s);
  return unbracketed.some(isAbba) && !bracketed.some(isAbba);
}

function supportsSsl(s: string): boolean {
  const { bracketed, unbracketed } = debracket(s);
  return unbracketed
    .map((s) =>
      iter(s)
        .aperture(3)
        .filter((s) => s[0] === s[2])
    )
    .flat()
    .some(([a, b]) => bracketed.some((s) => s.includes(`${b}${a}${b}`)));
}

example.equal(supportsTls('abba[mnop]qrst'), true);
example.equal(supportsTls('abcd[bddb]xyyx'), false);
example.equal(supportsTls('aaaa[qwer]tyui'), false);
example.equal(supportsTls('ioxxoj[asdfgh]zxcvbn'), true);

example.equal(supportsSsl('aba[bab]xyz'), true);
example.equal(supportsSsl('xyx[xyx]xyx'), false);
example.equal(supportsSsl('aaa[kek]eke'), true);
example.equal(supportsSsl('zazbz[bzb]cdb'), true);

const ips = load().lines;
export default solve(
  () => ips.filter(supportsTls).length,
  () => ips.filter(supportsSsl).length
).expect(115, 231);
