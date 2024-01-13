import { main } from 'lib/advent';

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

main(
  (s) => nextTenAfter(Number(s)),
  (s) => toTheLeftOf(s.trim())
);
