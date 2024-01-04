import { main } from 'lib/advent';
import { Iter, iter } from 'lib/iter';
import { lines } from 'lib/util';

const isAbba = (s: string): boolean => /(.)(?!\1)(.)\2\1/.test(s);

function debracket(s: string): {
  bracketed: Iter<string>;
  unbracketed: Iter<string>;
} {
  if (s[0] === '[') throw new Error();
  const [unbracketed, bracketed] = iter(s.split(/[[\]]/)).partition(
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

main(
  (s) => lines(s).filter(supportsTls).length,
  (s) => lines(s).filter(supportsSsl).length
);
