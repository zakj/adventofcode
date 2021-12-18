import { answers, example, load } from '../advent';

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

const examples: [string, number][] = [
  ['BFFFBBFRRR', 567],
  ['FFFBBBFRRR', 119],
  ['BBFFBBFRLL', 820],
];
examples.forEach((e) => example.equal(e[1], findSeatId(e[0])));

const seatIds = load(5).lines.map(findSeatId);
answers.expect(842, 617);
answers(
  () => Math.max(...seatIds),
  () => findMissing(seatIds)
);
