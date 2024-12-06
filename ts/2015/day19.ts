import { main } from 'lib/advent';
import { paragraphs } from 'lib/util';

type Rule = { src: string; dst: string };

function parse(s: string): [Rule[], string] {
  const chunks = paragraphs(s);
  return [
    chunks[0].map((line) => {
      const [src, dst] = line.split(' => ');
      return { src, dst };
    }),
    chunks[1][0],
  ];
}

function molecules(rules: Rule[], start: string): Set<string> {
  const rv = new Set<string>();

  rules.forEach(({ src, dst }) => {
    if (start.slice(0, src.length) === src) rv.add(start.replace(src, dst));
  });
  if (start.length > 1) {
    molecules(rules, start.slice(1)).forEach((v) => rv.add(start[0] + v));
  }

  return rv;
}

function fabricate(start: string, target: string): number {
  const atoms = target.replaceAll(/Rn|Ar|Y.|[a-z]/g, '');
  return atoms.length - start.length;
}

main(
  (s) => molecules(...parse(s)).size,
  (s) => fabricate('e', parse(s)[1]),
);
