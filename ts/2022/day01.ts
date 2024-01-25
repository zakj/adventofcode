import { main } from 'lib/advent';
import { iter } from 'lib/iter';
import { paragraphs } from 'lib/util';

function parse(s: string): number[] {
  return paragraphs(s).map((lines) => iter(lines).map(Number).sum());
}

main(
  (s) => iter(parse(s)).max(),
  (s) =>
    iter(parse(s).sort((a, b) => b - a))
      .take(3)
      .sum()
);
