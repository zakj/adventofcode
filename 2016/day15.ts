import { answers, example, load } from '../advent';

type Disc = { positions: number; time0: number };

function parse(lines: string[]): Disc[] {
  const re = /(\d+) positions.*position (\d+)\./;
  return lines.map((line) => {
    const match = line.match(re);
    const [positions, time0] = [Number(match[1]), Number(match[2])];
    return { positions, time0 };
  });
}

function isOpenAt(d: Disc, t: number): boolean {
  return (d.time0 + t) % d.positions === 0;
}

function firstButtonPress(discs: Disc[]): number {
  let time = 0;
  for (let time = 0; ; ++time) {
    if (discs.every((d, i) => isOpenAt(d, time + i + 1))) return time;
  }
}

const exampleDiscs = parse(load(15, 'ex').lines);
example.equal(firstButtonPress(exampleDiscs), 5);

const discs = parse(load(15).lines);
answers.expect(16824, 3543984);
answers(
  () => firstButtonPress(discs),
  () => firstButtonPress(discs.concat({ positions: 11, time0: 0 }))
);
