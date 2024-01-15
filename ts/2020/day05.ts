import { main } from 'lib/advent';
import { lines } from 'lib/util';

function findSeatId(boardingPass: string): number {
  let minRow = 0;
  let maxRow = 127;
  [...boardingPass].slice(0, 7).forEach((s) => {
    const length = maxRow - minRow + 1;
    if (s === 'F') {
      maxRow -= length / 2;
    } else if (s === 'B') {
      minRow += length / 2;
    }
  });

  let minSeat = 0;
  let maxSeat = 7;
  [...boardingPass].slice(7).forEach((s) => {
    const length = maxSeat - minSeat + 1;
    if (s === 'L') {
      maxSeat -= length / 2;
    } else if (s === 'R') {
      minSeat += length / 2;
    }
  });

  return minRow * 8 + minSeat;
}

function findMissing(arr: number[]): number {
  arr.sort((a, b) => a - b);
  return arr.slice(1).find((x, i) => arr[i] + 1 !== x) - 1;
}

main(
  (s) => Math.max(...lines(s).map(findSeatId)),
  (s) => findMissing(lines(s).map(findSeatId))
);
