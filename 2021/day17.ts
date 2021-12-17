import { answers, example, load } from '../advent';
import { Point } from '../coords';

function parse(lines: string[]) {
  const [_a, _b, _c, x, _d, y] = lines[0].split(/[\s=,]+/);
  const xx = x.split('..').map(Number);
  const yy = y.split('..').map(Number);
  return {
    min: { x: xx[0], y: yy[0] },
    max: { x: xx[1], y: yy[1] },
  };
}

type Probe = {
  pos: Point;
  vel: Point;
};

function step(probe: Probe): Probe {
  const newVelX =
    probe.vel.x > 0 ? probe.vel.x - 1 : probe.vel.x < 0 ? probe.vel.x + 1 : 0;
  return {
    pos: { x: probe.pos.x + probe.vel.x, y: probe.pos.y + probe.vel.y },
    vel: { x: newVelX, y: probe.vel.y - 1 },
  };
}

function part1(target): number {
  let maxHeight = -Infinity;
  for (let y = 10000; y > 0; --y) {
    for (let x = 100; x > 0; --x) {
      let probe = { pos: { x: 0, y: 0 }, vel: { x, y } };
      let maxHeightThisProbe = 0;
      while (probe.pos.y >= target.min.y) {
        probe = step(probe);
        maxHeightThisProbe = Math.max(maxHeightThisProbe, probe.pos.y);
        // console.log(probe);
        if (
          probe.pos.x >= target.min.x &&
          probe.pos.x <= target.max.x &&
          probe.pos.y >= target.min.y &&
          probe.pos.y <= target.max.y
        ) {
          console.log('^ GOT ONE', probe, { x, y });
          maxHeight = Math.max(maxHeight, maxHeightThisProbe);
          break;
        }
      }
    }
  }
  return maxHeight;
}

function part2(target): number {
  let hits = 0;
  // let hitSet = new PointSet();
  for (let y = 10000; y > -150; --y) {
    for (let x = 200; x > 0; --x) {
      let probe = { pos: { x: 0, y: 0 }, vel: { x, y } };
      while (probe.pos.y >= target.min.y) {
        probe = step(probe);
        // if (x === 6 && y === 0) console.log(probe);
        if (
          probe.pos.x >= target.min.x &&
          probe.pos.x <= target.max.x &&
          probe.pos.y >= target.min.y &&
          probe.pos.y <= target.max.y
        ) {
          // if (x === 6 && y === 0) console.log('HIT');
          hits++;
          // hitSet.add({ x, y });
          break;
        }
      }
    }
  }
  // for (const { x, y } of hitSet) {
  //   console.log(`${x},${y}`);
  // }
  return hits;
}

const exampleData = parse(['target area: x=20..30, y=-10..-5']);
example.equal(part1(exampleData), 45);
example.equal(part2(exampleData), 112);

const target = parse(load(17).lines);
answers.expect(10878, 4716);
answers(
  () => part1(target),
  () => part2(target)
);
