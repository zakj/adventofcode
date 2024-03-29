import { main } from 'lib/advent';
import { intersect, Point, Rect } from 'lib/coords';

function parse(s: string): Rect {
  const match = s
    .match(/target area: x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)/)
    .slice(1, 5)
    .map(Number);
  return {
    min: { x: match[0], y: match[2] },
    max: { x: match[1], y: match[3] },
  };
}

type Probe = {
  pos: Point;
  vel: Point;
};

function findMaxHeight(target: Rect): number {
  // Every trajectory that goes above y=0 will eventually return to y=0 with y
  // velocity = -(launch velocity + 1). The winning trajectory will reach the
  // bottom of the target area on the next step (otherwise we either overshoot
  // or could have gone higher) Therefore, winning launch velocity is n.
  const n = -target.min.y - 1;
  // Max height for a trajectory starting at n is the sum of 1..n, for which
  // there's a formula!
  return (n * (1 + n)) / 2;
}

function step(probe: Probe): Probe {
  return {
    pos: { x: probe.pos.x + probe.vel.x, y: probe.pos.y + probe.vel.y },
    vel: { x: probe.vel.x - Math.sign(probe.vel.x), y: probe.vel.y - 1 },
  };
}

function countHits(target: Rect): number {
  let hits = 0;
  if (target.min.x <= 0 || target.max.y >= 0) throw 'broken assumptions';
  for (let y = target.min.y; y < -target.min.y; ++y) {
    for (let x = target.max.x; x > 0; --x) {
      let probe: Probe = { pos: { x: 0, y: 0 }, vel: { x, y } };
      while (probe.pos.y >= target.min.y) {
        probe = step(probe);
        if (intersect(probe.pos, target)) {
          hits++;
          break;
        }
      }
    }
  }
  return hits;
}

main(
  (s) => findMaxHeight(parse(s)),
  (s) => countHits(parse(s))
);
