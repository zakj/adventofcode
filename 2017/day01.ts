import { answers, example, load } from '../advent';
import { sum } from '../util';

function captcha(s: string, offset: number = 1): number {
  return sum(
    s.split('').map((a, i) => {
      const b = s[(i + offset) % s.length];
      return a === b ? Number(a) : 0;
    })
  );
}

example.equal(captcha('1122'), 3);
example.equal(captcha('1111'), 4);
example.equal(captcha('1234'), 0);
example.equal(captcha('91212129'), 9);

example.equal(captcha('1212', 2), 6);
example.equal(captcha('1221', 2), 0);
example.equal(captcha('123425', 3), 4);
example.equal(captcha('123123', 3), 12);
example.equal(captcha('12131415', 4), 4);

const input = load(1).raw.trim();
answers.expect(1203, 1146);
answers(
  () => captcha(input),
  () => captcha(input, input.length / 2)
);
