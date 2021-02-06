import { answers, example, load } from '../advent';

type PointHash = string;

function powerLevel(x: number, y: number, serial: number): number {
  const rackId = x + 10;
  const power = (rackId * y + serial) * rackId;
  return Math.floor((power % 1000) / 100) - 5;
}

const key = (...args: number[]): PointHash => args.join(',');

class SummedAreaTable {
  private sums: Map<PointHash, number>;

  constructor(
    width: number,
    height: number,
    value: (x: number, y: number) => number
  ) {
    this.sums = new Map();
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const sum =
          value(x, y) +
          (this.sums.get(key(x, y - 1)) || 0) +
          (this.sums.get(key(x - 1, y)) || 0) -
          (this.sums.get(key(x - 1, y - 1)) || 0);
        this.sums.set(key(x, y), sum);
      }
    }
  }

  get(x: number, y: number, size: number): number {
    const tl = key(x - 1, y - 1);
    const br = key(x + size - 1, y + size - 1);
    const tr = key(x + size - 1, y - 1);
    const bl = key(x - 1, y + size - 1);
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
  return [key(max.x, max.y), max.value];
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
  return [key(max.x, max.y, max.size), max.value];
}

example.equal(powerLevel(3, 5, 8), 4);
example.equal(powerLevel(122, 79, 57), -5);
example.equal(powerLevel(217, 196, 39), 0);
example.equal(powerLevel(101, 153, 71), 4);

example.deepEqual(maxSquareValue(18), ['33,45', 29]);
example.deepEqual(maxSquareValue(42), ['21,61', 30]);
example.deepEqual(maxSquareValueAnySize(18), ['90,269,16', 113]);
example.deepEqual(maxSquareValueAnySize(42), ['232,251,12', 119]);

const serial = Number(load(11).raw);
answers.expect('241,40', '166,75,12');
answers(
  () => maxSquareValue(serial)[0],
  () => maxSquareValueAnySize(serial)[0]
);
