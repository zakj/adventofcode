import { answers, load } from '../advent';
import { findBounds, parseMap, PointMap } from '../coords';

type Bit = 1 | 0;
type Image = PointMap<Bit>;
type Thing = {
  algorithm: Bit[];
  image: Image;
  fallback: Bit;
};

function parse(paras: string[][]): Thing {
  const translate = (c: string): Bit => (c === '#' ? 1 : 0);
  return {
    algorithm: paras[0][0].split('').map(translate),
    image: parseMap<Bit>(paras[1], translate),
    fallback: 0,
  };
}

function enhance({ image, algorithm, fallback }: Thing): Thing {
  const bounds = findBounds(image);
  const next = new PointMap<Bit>();
  const b = (x: number, y: number) =>
    image.has({ y: y - 1, x: x - 1 })
      ? image.get({ y: y - 1, x: x - 1 })
      : fallback;

  for (let x = bounds.min.x - 2; x <= bounds.max.x + 2; ++x) {
    for (let y = bounds.min.y - 2; y <= bounds.max.y + 2; ++y) {
      const bits = [
        b(x - 1, y - 1),
        b(x, y - 1),
        b(x + 1, y - 1),
        b(x - 1, y),
        b(x, y),
        b(x + 1, y),
        b(x - 1, y + 1),
        b(x, y + 1),
        b(x + 1, y + 1),
      ];
      next.set({ x, y }, algorithm[parseInt(bits.join(''), 2)]);
    }
  }
  const nextFallback =
    algorithm[parseInt(new Array(9).fill(fallback).join(''), 2)];
  return { image: next, algorithm, fallback: nextFallback };
}

const exampleData = parse(
  `..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#

#..#.
#....
##..#
..#..
..###`
    .split('\n\n')
    .map((l) => l.split('\n'))
);
// example.equal(enhance(exampleData.input, exampleData.algo), 1);
const dd = enhance(exampleData);
const ee = enhance(dd);
console.log([...ee.image.values()].filter((x) => x).length);

const data = parse(load(20).paragraphs);
answers.expect(5680, 19766);
answers(
  () => {
    const aa = enhance(data);
    const bb = enhance(aa);
    return [...bb.image.values()].filter((x) => x).length;
  },
  () => {
    let val = data;
    for (let i = 0; i < 50; ++i) {
      val = enhance(val);
    }
    return [...val.image.values()].filter((x) => x).length;
  }
);
