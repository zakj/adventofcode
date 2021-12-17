import { answers, load } from '../advent';
import {
  findBounds,
  neighbors4 as neighbors,
  parseMap,
  Point,
  PointMap,
} from '../coords';
import { PriorityQueue, range } from '../util';

type RiskMap = PointMap<number>;

function leastRisk(riskMap: RiskMap): number {
  const { max: end } = findBounds(riskMap.keys());
  const start = { x: 0, y: 0 };
  const riskTo = new PointMap<number>([[start, 0]]);
  const q = new PriorityQueue<Point>(
    (p) => riskTo.get(p) + (end.x - p.x) + (end.y - p.y)
  );
  q.add(start);

  while (q.length) {
    let cur = q.shift();
    if (cur.x === end.x && cur.y === end.y) break;
    const curRisk = riskTo.get(cur);
    const ns = neighbors(cur).filter((p) => riskMap.has(p));
    for (const next of ns) {
      const nextRisk = curRisk + riskMap.get(next);
      if (!riskTo.has(next) || riskTo.get(next) > nextRisk) {
        riskTo.set(next, nextRisk);
        q.add(next);
      }
    }
  }

  return riskTo.get(end);
}

// TODO: refactor?
function expandMap(map: RiskMap, by: number = 5) {
  const expanded = new PointMap<number>();
  const { max } = findBounds(map.keys());
  const row = new PointMap<number>(
    [...map.entries()].flatMap(([p, risk]): [Point, number][] => {
      return range(0, by).map((i) => [
        { x: p.x + (1 + max.x) * i, y: p.y },
        ((risk + i - 1) % 9) + 1,
      ]);
    })
  );
  return new PointMap<number>(
    [...row.entries()].flatMap(([p, risk]): [Point, number][] => {
      if (map.has(p) && (p.x > max.x || p.y > max.y)) throw 'fo';
      return range(0, by).map((i) => [
        { x: p.x, y: p.y + (1 + max.y) * i },
        ((risk + i - 1) % 9) + 1, // TODO: is there a better way?
      ]);
    })
  );
}

const riskMap = parseMap(load(15).lines, Number);
answers.expect(415, 2864);
answers(
  () => leastRisk(riskMap),
  () => leastRisk(expandMap(riskMap))
);
