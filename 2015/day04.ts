import { load, solve } from '../advent';
import { md5 } from '../util';

function findHashPrefix(input: string, prefix: string): number {
  const re = new RegExp(`^${prefix}`);
  let i = 1;
  while (true) {
    if (re.test(md5(input + i))) return i;
    ++i;
  }
}

const input = load().raw.trim();
export default solve(
  () => findHashPrefix(input, '00000'),
  () => findHashPrefix(input, '000000')
).expect(254575, 1038736);
