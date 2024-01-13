import { main } from 'lib/advent';
import { sum } from 'lib/util';

function captcha(s: string, offset = 1): number {
  return sum(
    s.split('').map((a, i) => {
      const b = s[(i + offset) % s.length];
      return a === b ? Number(a) : 0;
    })
  );
}

main(
  (s) => captcha(s.trim()),
  (s) => captcha(s.trim(), s.trim().length / 2)
);
