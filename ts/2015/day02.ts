import { main } from 'lib/advent';
import { allNumbers, lines, sum } from 'lib/util';

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

main(
  (s) => sum(lines(s).map(allNumbers).map(paperNeeded)),
  (s) => sum(lines(s).map(allNumbers).map(ribbonNeeded))
);
