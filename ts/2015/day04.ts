import { main } from 'lib/advent';
import { md5 } from 'lib/util';

function findHashPrefix(input: string, prefix: string): number {
  const re = new RegExp(`^${prefix}`);
  let i = 1;
  for (;;) {
    if (re.test(md5(input + i))) return i;
    ++i;
  }
}

main(
  (s) => findHashPrefix(s.trim(), '00000'),
  (s) => findHashPrefix(s.trim(), '000000')
);
