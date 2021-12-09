import { answers, load } from '../advent';
import { product, XSet } from '../util';

// const exampleData = parse(load(8, 'ex').lines);
// example.equal(decodedOutput(exampleData), 5353);

function parse(lines: string[]): number[][] {
  return lines.map((line) => line.split('').map(Number));
}

function neighbors(x: number, y: number) {
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];
}

const h = ({ x, y }): string => `${x},${y}`;

function findLowPoints(heightmap) {
  const points = [];
  for (let y = 0; y < heightmap.length; ++y) {
    const row = heightmap[y];
    for (let x = 0; x < row.length; ++x) {
      const val = row[x];
      const ns = neighbors(x, y).filter(
        ({ x, y }) => x >= 0 && x < row.length && y >= 0 && y < heightmap.length
      );
      if (ns.every(({ x, y }) => heightmap[y][x] > val)) points.push({ x, y });
    }
  }
  return points;
}

const heightmap = parse(load(9).lines);
answers.expect(516);
answers(
  () => {
    let risk = 0;
    for (let y = 0; y < heightmap.length; ++y) {
      const row = heightmap[y];
      for (let x = 0; x < row.length; ++x) {
        const val = row[x];
        const ns = neighbors(x, y).filter(
          ({ x, y }) =>
            x >= 0 && x < row.length && y >= 0 && y < heightmap.length
        );
        if (ns.every(({ x, y }) => heightmap[y][x] > val)) risk += val + 1;
      }
    }
    return risk;
  },
  () => {
    const lowPoints = findLowPoints(heightmap);
    const height = heightmap.length;
    const width = heightmap[0].length;
    const basins = [];
    for (const { x, y } of lowPoints) {
      const basin = new XSet(h, [{ x, y }]);
      const q = [{ x, y }];
      while (q.length) {
        const cur = q.pop();
        const ns = neighbors(cur.x, cur.y).filter(
          ({ x, y }) =>
            x >= 0 && x < width && y >= 0 && y < height && heightmap[y][x] < 9
        );
        for (const p of ns) {
          if (basin.has(p)) continue;
          basin.add(p);
          q.push(p);
        }
      }
      basins.push(basin.size);
    }
    console.log('basins', basins.length);
    basins.sort((a, b) => b - a);
    console.log(basins[0]);
    return product(basins.slice(0, 3));
  }
);
