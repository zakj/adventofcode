import { example, load, solve } from '../advent';

function createRecipes(n: number, needle?: string): number[] {
  const scores = [3, 7];
  let elf1 = 0;
  let elf2 = 1;
  let haystack = scores.join('');
  const re = new RegExp(`^${needle}.?$`);
  const nlen = needle?.length;
  while ((n && scores.length < n) || (needle && !re.test(haystack))) {
    const [a, b] = [scores[elf1], scores[elf2]];
    const sum = a + b;
    if (sum >= 10) scores.push(Math.floor(sum / 10));
    scores.push(sum % 10);
    if (needle) haystack = (haystack + sum).slice(-nlen - 1);
    elf1 = (elf1 + a + 1) % scores.length;
    elf2 = (elf2 + b + 1) % scores.length;
  }
  return scores;
}

function nextTenAfter(n: number): string {
  return createRecipes(n + 10)
    .slice(n, n + 10)
    .join('');
}

function toTheLeftOf(needle: string): number {
  return createRecipes(0, needle).join('').indexOf(needle);
}

example.equal(nextTenAfter(9), '5158916779');
example.equal(nextTenAfter(5), '0124515891');
example.equal(nextTenAfter(18), '9251071085');
example.equal(nextTenAfter(2018), '5941429882');

example.equal(toTheLeftOf('51589'), 9);
example.equal(toTheLeftOf('01245'), 5);
example.equal(toTheLeftOf('92510'), 18);
example.equal(toTheLeftOf('59414'), 2018);

const input = load().raw;
export default solve(
  () => nextTenAfter(Number(input)),
  () => toTheLeftOf(input.trim())
).expect('6289129761', 20207075);
