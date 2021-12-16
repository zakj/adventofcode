import { answers, load } from '../advent';
import { neighbors4, parseMap, Point, PointMap, PointSet } from '../coords';
import { product, sum } from '../util';

function lowPoints(heightmap: PointMap<number>): Point[] {
  return [...heightmap]
    .filter(([p, height]) => {
      return neighbors4(p)
        .filter((n) => heightmap.has(n))
        .every((n) => heightmap.get(n) > height);
    })
    .map(([p]) => p);
}

function basinSizes(heightmap: PointMap<number>): number[] {
  return lowPoints(heightmap)
    .map((point) => {
      const basin = new PointSet([point]);
      const q = [point];
      while (q.length) {
        const cur = q.pop();
        const ns = neighbors4(cur).filter(
          (cur) => heightmap.has(cur) && heightmap.get(cur) < 9
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

const heightmap = parseMap(load(9).lines, Number);
answers.expect(516, 1023660);
answers(
  () => sum(lowPoints(heightmap).map((p) => heightmap.get(p) + 1)),
  () => product(basinSizes(heightmap).slice(0, 3))
);
