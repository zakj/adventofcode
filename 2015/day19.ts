import { answers, example, load } from '../advent';

type Rule = { src: string; dst: string };

function parse(chunks: string[][]): [Rule[], string] {
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
  const throwaway = ['Rn', 'Ar', 'Y.', '[a-z]'].map((x) => new RegExp(x, 'g'));
  const atoms = throwaway.reduce((s, re) => s.replaceAll(re, ''), target);
  return atoms.length - start.length;
}

const [exampleRules, exampleMolecule] = parse(load(19, 'ex').paragraphs);
example.equal(molecules(exampleRules, exampleMolecule).size, 7);

const [rules, molecule] = parse(load(19).paragraphs);
answers.expect(535, 212);
answers(
  () => molecules(rules, molecule).size,
  () => fabricate('e', molecule)
);
