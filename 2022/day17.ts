import { example, load, solve } from 'lib/advent';
import { Dir, move, parseMap, Point, PointSet } from 'lib/coords';
import { range } from 'lib/iter';
import { XMap } from 'lib/util';

const jetToDir = {
  '>': Dir.Right,
  '<': Dir.Left,
};

function parse(line: string): Dir[] {
  return line.split('').map((s) => jetToDir[s]);
}

const rockTypes: PointSet[] = [
  ['####'],
  [' # ', '###', ' # '],
  ['  #', '  #', '###'],
  ['#', '#', '#', '#'],
  ['##', '##'],
].map(
  (lines) =>
    new PointSet(
      [...parseMap(lines, (c) => c === '#').entries()]
        .filter(([, c]) => c)
        .map(([p]) => p)
    )
);
const rockHeights = [1, 3, 3, 4, 2];

function offset(rock: PointSet, by: Point): PointSet {
  return new PointSet([...rock].map((p) => ({ x: p.x + by.x, y: p.y + by.y })));
}

function part1_old(jets: Dir[], cycles = 2022): number {
  // new rocks come in with left edge 2 units away from left wall, and bottom
  // edge three units above the highest rock or the floor
  //
  let top = 0;
  let bottom = 0;
  const cave = new PointSet();

  console.log(jets.length / cycles);
  console.log(rockTypes.length / cycles);
  console.log(jets.length / rockTypes.length);
  return 0;

  const pointIsClear = (p: Point): boolean =>
    p.y < 0 && p.x >= 0 && p.x < 7 && !cave.has(p);

  let jIndex = 0;
  for (let i = 0; i < cycles; ++i) {
    const rock = rockTypes[i % rockTypes.length];
    let pos = { x: 2, y: top - 3 - rockHeights[i % rockTypes.length] };
    let resting = false;
    while (!resting) {
      const jetDir = jets[jIndex++ % jets.length];
      let newPos = move(pos, jetDir);
      if ([...offset(rock, newPos)].every(pointIsClear)) pos = newPos;
      newPos = move(pos, Dir.Down);
      if ([...offset(rock, newPos)].every(pointIsClear)) pos = newPos;
      else {
        top = Math.min(top, pos.y);
        [...offset(rock, pos)].forEach((p) => cave.add(p));
        resting = true;
        // if we have a tetris, remove all the below blocks from cave
        let found = false;
        if (i % 10000 === 0) {
          // console.log('cycle', i, cave.size, bottom);
          console.log('cycle', i);
          let newBottom = bottom;
          for (let y = top + 100; y < bottom; ++y) {
            // if (found) {
            range(7).forEach((x) => cave.delete({ x, y }));
            // } else {
            //   if (range(7).every((x) => cave.has({ x, y }))) {
            //     console.log('TETRIS', y);
            //     found = true;
            //     newBottom = y;
            //   }
            // }
          }
          bottom = top + 100;
        }
      }
    }
  }

  return top * -1;
}

function part1(jets: Dir[], cycles = 2022): number {
  let top = 0;
  let bottom = 0;
  const cave = new PointSet();

  // console.log(jets.length / rockTypes.length);
  // return 0;

  // top x positions, rockid, jetid -> top, cycle num
  const seen = new XMap<[number, number, number], { i: number; top: number }>(
    (ns) => ns.join(',')
  );

  const topRow = (y: number) =>
    range(7)
      .filter((x) => cave.has({ x, y }))
      .reduce((hash, x) => 1 << x, 0);

  const pointIsClear = (p: Point): boolean =>
    p.y < 0 && p.x >= 0 && p.x < 7 && !cave.has(p);

  let jetIndex = 0;
  let repeatAddition = 0;
  for (let i = 0; i < cycles; ++i) {
    const rockIndex = i % rockTypes.length;
    const rock = rockTypes[rockIndex];
    let pos = { x: 2, y: top - 3 - rockHeights[i % rockTypes.length] };
    let resting = false;
    while (!resting) {
      const jetDir = jets[jetIndex % jets.length];
      jetIndex = (jetIndex + 1) % jets.length;
      let newPos = move(pos, jetDir);
      if ([...offset(rock, newPos)].every(pointIsClear)) pos = newPos;
      newPos = move(pos, Dir.Down);
      if ([...offset(rock, newPos)].every(pointIsClear)) pos = newPos;
      else {
        [...offset(rock, pos)].forEach((p) => cave.add(p));
        resting = true;
        const delta = top - Math.min(top, pos.y);
        top = Math.min(top, pos.y);
        const cache: [number, number, number] = [
          topRow(top),
          rockIndex,
          jetIndex,
        ];
        if (!repeatAddition && seen.has(cache)) {
          const seenData = seen.get(cache);
          const iDelta = i - seenData.i;
          const topDelta = top - seenData.top;
          const remaining = cycles - i;
          const repeatIterations = Math.floor(remaining / iDelta);
          repeatAddition = Math.abs(repeatIterations * topDelta);
          cycles -= repeatIterations * iDelta;
        }
        if (delta > 0) seen.set(cache, { i, top });
      }
    }
  }

  return Math.abs(top) + repeatAddition;
}

const exampleData = parse('>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>');
example.equal(part1(exampleData, 2022), 3068);
example.equal(part1(exampleData, 1000000000000), 1514285714288);

const data = parse(load().lines[0]);
export default solve(
  () => part1(data),
  () => part1(data, 1000000000000)
).expect(3173, 1570930232582);
