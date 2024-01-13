import { main } from 'lib/advent';
import { PointMap, pointToString } from 'lib/coords';

function powerLevel(x: number, y: number, serial: number): number {
  const rackId = x + 10;
  const power = (rackId * y + serial) * rackId;
  return Math.floor((power % 1000) / 100) - 5;
}

class SummedAreaTable {
  private sums: PointMap<number>;

  constructor(
    width: number,
    height: number,
    value: (x: number, y: number) => number
  ) {
    this.sums = new PointMap();
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const sum =
          value(x, y) +
          (this.sums.get({ x, y: y - 1 }) || 0) +
          (this.sums.get({ x: x - 1, y }) || 0) -
          (this.sums.get({ x: x - 1, y: y - 1 }) || 0);
        this.sums.set({ x, y }, sum);
      }
    }
  }

  get(x: number, y: number, size: number): number {
    const tl = { x: x - 1, y: y - 1 };
    const br = { x: x + size - 1, y: y + size - 1 };
    const tr = { x: x + size - 1, y: y - 1 };
    const bl = { x: x - 1, y: y + size - 1 };
    return (
      this.sums.get(tl) +
      this.sums.get(br) -
      this.sums.get(tr) -
      this.sums.get(bl)
    );
  }
}

function maxSquareValue(serial: number) {
  const sums = new SummedAreaTable(301, 301, (x, y) =>
    Math.min(x, y) === 0 ? 0 : powerLevel(x, y, serial)
  );
  const max = { x: 0, y: 0, value: -Infinity };
  for (let x = 1; x <= 300 - 2; ++x) {
    for (let y = 1; y <= 300 - 2; ++y) {
      const v = sums.get(x, y, 3);
      if (v > max.value) {
        max.x = x;
        max.y = y;
        max.value = v;
      }
    }
  }
  return [pointToString(max), max.value];
}

function maxSquareValueAnySize(serial: number) {
  const sums = new SummedAreaTable(301, 301, (x, y) =>
    Math.min(x, y) === 0 ? 0 : powerLevel(x, y, serial)
  );
  const max = { x: 0, y: 0, size: 0, value: -Infinity };
  for (let size = 1; size < 20; ++size) {
    for (let x = 1; x <= 300 - size - 1; ++x) {
      for (let y = 1; y <= 300 - size - 1; ++y) {
        const v = sums.get(x, y, size);
        if (v > max.value) {
          max.x = x;
          max.y = y;
          max.size = size;
          max.value = v;
        }
      }
    }
  }
  return [`${pointToString(max)},${max.size}`, max.value];
}

main(
  (s) => maxSquareValue(Number(s))[0],
  (s) => maxSquareValueAnySize(Number(s))[0]
);
