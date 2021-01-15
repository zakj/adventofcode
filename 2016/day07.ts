import { answers, example, load } from './advent';
import { range } from './util';

const isAbba = (s: string): boolean => /(.)(?!\1)(.)\2\1/.test(s);

function debracket(s: string): { bracketed: string[]; unbracketed: string[] } {
  if (s[0] === '[') throw new Error();
  const unbracketed = [];
  const bracketed = [];
  s.split(/[\[\]]/).forEach((c, i) => {
    if (i % 2 === 0) unbracketed.push(c);
    else bracketed.push(c);
  });
  return { bracketed, unbracketed };
}

function supportsTls(s: string): boolean {
  const { bracketed, unbracketed } = debracket(s);
  return unbracketed.some(isAbba) && !bracketed.some(isAbba);
}

function supportsSsl(s: string): boolean {
  const { bracketed, unbracketed } = debracket(s);
  return unbracketed
    .reduce(
      (matches, s) =>
        matches.concat(
          range(0, s.length - 2)
            .map((i) => s.slice(i, i + 3))
            .filter((s) => s[0] === s[2])
        ),
      []
    )
    .some(([a, b]) => bracketed.some((s) => s.match(`${b}${a}${b}`)));
}

example.equal(supportsTls('abba[mnop]qrst'), true);
example.equal(supportsTls('abcd[bddb]xyyx'), false);
example.equal(supportsTls('aaaa[qwer]tyui'), false);
example.equal(supportsTls('ioxxoj[asdfgh]zxcvbn'), true);

example.equal(supportsSsl('aba[bab]xyz'), true);
example.equal(supportsSsl('xyx[xyx]xyx'), false);
example.equal(supportsSsl('aaa[kek]eke'), true);
example.equal(supportsSsl('zazbz[bzb]cdb'), true);

const ips = load(7).lines;
answers(
  () => ips.filter(supportsTls).length,
  () => ips.filter(supportsSsl).length
);
