import { answers, load } from '../advent';
import { product, sum, XSet } from '../util';

type Point = { x: number; y: number; val?: number };
const h = ({ x, y }: Point): string => `${x},${y}`;

function parse(lines: string[]): number[][] {
  return lines.map((line) => line.split('').map(Number));
}

function neighbors(x: number, y: number): Point[] {
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];
}

function inBounds({ x, y }: Point, heightmap: number[][]) {
  return x >= 0 && x < heightmap[0].length && y >= 0 && y < heightmap.length;
}

function lowPoints(heightmap: number[][]): Point[] {
  return heightmap.flatMap((row, y) => {
    return row
      .map((val, x) => ({ val, x, y }))
      .filter(({ val, x, y }) => {
        const ns = neighbors(x, y).filter((p) => inBounds(p, heightmap));
        return ns.every((p) => heightmap[p.y][p.x] > val);
      });
  });
}

function basinSizes(heightmap: number[][]): number[] {
  return lowPoints(heightmap)
    .map((point) => {
      const basin = new XSet(h, [point]);
      const q = [point];
      while (q.length) {
        const cur = q.pop();
        const ns = neighbors(cur.x, cur.y).filter(
          ({ x, y }) => inBounds({ x, y }, heightmap) && heightmap[y][x] < 9
        );
        for (const p of ns) {
          if (basin.has(p)) continue;
          basin.add(p);
          q.push(p);
        }
      }
      return basin.size;
    })
    .sort((a, b) => b - a);
}

const heightmap = parse(load(9).lines);
answers.expect(516, 1023660);
answers(
  () => sum(lowPoints(heightmap).map(({ val }) => val + 1)),
  () => product(basinSizes(heightmap).slice(0, 3))
);
