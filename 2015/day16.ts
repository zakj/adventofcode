import { answers, load } from './advent';

const tickerTape = new Map(
  Object.entries({
    children: 3,
    cats: 7,
    samoyeds: 2,
    pomeranians: 3,
    akitas: 0,
    vizslas: 0,
    goldfish: 5,
    trees: 3,
    cars: 2,
    perfumes: 1,
  })
);

type Aunt = {
  i: number;
  properties: Map<string, number>;
};

function parse(lines: string[]): Aunt[] {
  const re = /^Sue (?<i>\d+): (?<properties>.*)$/;
  return lines.map((line) => {
    const match = line.match(re);
    return {
      i: Number(match.groups.i),
      properties: new Map(
        match.groups.properties.split(', ').map((p) => {
          const [k, v] = p.split(': ');
          return [k, Number(v)];
        })
      ),
    };
  });
}

function findAunt1(aunts: Aunt[]): Aunt {
  return aunts.find((aunt) =>
    [...aunt.properties.entries()].every(([k, v]) => tickerTape.get(k) === v)
  );
}

function findAunt2(aunts: Aunt[]): Aunt {
  return aunts.find((aunt) =>
    [...aunt.properties.entries()].every(([k, v]) => {
      if (['cats', 'trees'].includes(k)) return tickerTape.get(k) < v;
      else if (['pomeranians', 'goldfish'].includes(k)) return tickerTape.get(k) > v;
      else return tickerTape.get(k) === v;
    })
  );
}

const aunts = parse(load(16).lines);
answers(
  () => findAunt1(aunts).i,
  () => findAunt2(aunts).i
);
