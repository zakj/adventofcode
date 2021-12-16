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

function leastRiskNaive(points: RiskMap): number {
  const { max } = findBounds(points.keys());
  let minRisk = Infinity;
  const q: [Point, number][] = [[{ x: 0, y: 0 }, 0]];
  const visitedRisk = new PointMap<number>(q);
  while (q.length) {
    let [cur, risk] = q.pop();
    risk = Math.min(risk, visitedRisk.get(cur) || Infinity);
    if (cur.x === max.x && cur.y === max.y) {
      minRisk = Math.min(risk, minRisk);
      continue;
    }
    const ns = neighbors(cur).filter((p) => points.has(p));
    for (const p of ns) {
      const nextRisk = risk + points.get(p);
      if ((visitedRisk.get(p) || Infinity) <= nextRisk) continue;
      visitedRisk.set(p, nextRisk);
      q.push([p, nextRisk]);
    }
  }
  return minRisk;
}

function leastRisk(riskMap: RiskMap): number {
  const { max } = findBounds(riskMap.keys());
  let minRisk = Infinity;

  const start = { x: 0, y: 0 };
  const riskTo = new PointMap<number>([[start, 0]]);
  const q = new PriorityQueue<Point>(
    (p) => riskTo.get(p) + (max.x - p.x) + (max.y - p.y)
  );
  q.add(start);

  while (q.length) {
    let cur = q.shift();
    if (cur.x === max.x && cur.y === max.y) break;
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

  return riskTo.get(max);
}

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
