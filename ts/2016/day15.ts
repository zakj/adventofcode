import { main } from 'lib/advent';
import { lines } from 'lib/util';

type Disc = { positions: number; time0: number };

function parse(s: string): Disc[] {
  const re = /(\d+) positions.*position (\d+)\./;
  return lines(s).map((line) => {
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
  for (;;) {
    if (discs.every((d, i) => isOpenAt(d, time + i + 1))) return time;
    ++time;
  }
}

main(
  (s) => firstButtonPress(parse(s)),
  (s) => firstButtonPress(parse(s).concat({ positions: 11, time0: 0 }))
);
