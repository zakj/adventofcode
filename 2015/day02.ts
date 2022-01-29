import { load, solve } from 'lib/advent';
import { sum } from 'lib/util';

function paperNeeded([l, w, h]): number {
  const surface = 2 * l * w + 2 * w * h + 2 * h * l;
  const slack = Math.min(l * w, w * h, h * l);
  return surface + slack;
}

function ribbonNeeded([l, w, h]): number {
  const wrap = sum(
    [l, w, h]
      .sort((a, b) => a - b)
      .slice(0, 2)
      .map((x) => 2 * x)
  );
  const bow = l * w * h;
  return wrap + bow;
}

const boxes = load().lines.map((line) => line.split('x').map(Number));
export default solve(
  () => sum(boxes.map(paperNeeded)),
  () => sum(boxes.map(ribbonNeeded))
).expect(1588178, 3783758);
