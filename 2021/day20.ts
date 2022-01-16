import { load, solve } from '../advent';
import { parseGrid, PointGrid } from '../coords';
import { range } from '../util';

type Bit = 0 | 1;
type Thing = {
  algorithm: Bit[];
  image: PointGrid<Bit>;
  fallback: Bit;
};

function parse(paras: string[][]): Thing {
  const translate = (c: string): Bit => (c === '#' ? 1 : 0);
  return {
    algorithm: paras[0][0].split('').map(translate),
    image: parseGrid<Bit>(paras[1], translate),
    fallback: 0,
  };
}

function enhance({ image, algorithm, fallback }: Thing): Thing {
  const b = (x: number, y: number) => image.get(x - 1, y - 1) ?? fallback;
  const algo = (bits: Bit[]) =>
    algorithm[bits.reduce((v, b) => (v << 1) + b, 0)];

  const arr = range(0, image.height + 5).map((y) =>
    range(0, image.width + 5).map((x) =>
      algo([
        b(x - 1, y - 1),
        b(x, y - 1),
        b(x + 1, y - 1),
        b(x - 1, y),
        b(x, y),
        b(x + 1, y),
        b(x - 1, y + 1),
        b(x, y + 1),
        b(x + 1, y + 1),
      ])
    )
  );

  const nextFallback = algo(new Array(9).fill(fallback));
  return { image: PointGrid.from(arr), algorithm, fallback: nextFallback };
}

const data = parse(load().paragraphs);
export default solve(
  () => range(0, 2).reduce(enhance, data).image.filter(Boolean).length,
  () => range(0, 50).reduce(enhance, data).image.filter(Boolean).length
).expect(5680, 19766);
