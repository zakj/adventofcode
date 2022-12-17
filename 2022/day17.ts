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

const rockTypes: { rock: PointSet; height: number }[] = [
  ['####'],
  [' # ', '###', ' # '],
  ['  #', '  #', '###'],
  ['#', '#', '#', '#'],
  ['##', '##'],
].map((lines) => ({
  rock: new PointSet(
    [...parseMap(lines, (c) => c === '#').entries()]
      .filter(([, c]) => c)
      .map(([p]) => p)
  ),
  height: lines.length,
}));

function offset(rock: PointSet, by: Point): PointSet {
  return new PointSet([...rock].map((p) => ({ x: p.x + by.x, y: p.y + by.y })));
}

function caveTopAfter(jets: Dir[], cycles: number): number {
  const cave = new PointSet();

  type Seen = [topX: number, rockIndex: number, jetIndex: number];
  const seen = new XMap<Seen, { i: number; top: number }>((ns) => ns.join(','));

  let top = 0;
  const topRow = (y: number) =>
    range(7)
      .filter((x) => cave.has({ x, y }))
      .reduce((hash, x) => 1 << x, 0);

  const isOpen = (p: Point): boolean =>
    p.y < 0 && p.x >= 0 && p.x < 7 && !cave.has(p);

  let jetIndex = 0;
  let repeatAddition = 0;

  for (let i = 0; i < cycles; ++i) {
    const rockIndex = i % rockTypes.length;
    const { rock, height } = rockTypes[rockIndex];
    let pos = { x: 2, y: top - 3 - height };

    for (;;) {
      const jetDir = jets[jetIndex];
      jetIndex = (jetIndex + 1) % jets.length;

      let newPos = move(pos, jetDir);
      if ([...offset(rock, newPos)].every(isOpen)) pos = newPos;

      newPos = move(pos, Dir.Down);
      if ([...offset(rock, newPos)].every(isOpen)) pos = newPos;
      else {
        // Rock has come to rest.
        [...offset(rock, pos)].forEach((p) => cave.add(p));
        top = Math.min(top, pos.y);
        const cache: Seen = [topRow(top), rockIndex, jetIndex];
        if (!repeatAddition && seen.has(cache)) {
          const seenData = seen.get(cache);
          const iDelta = i - seenData.i;
          const repeatIterations = Math.floor((cycles - i) / iDelta);
          repeatAddition = Math.abs(repeatIterations * (top - seenData.top));
          cycles -= repeatIterations * iDelta;
        }
        seen.set(cache, { i, top });
        break;
      }
    }
  }

  return Math.abs(top) + repeatAddition;
}

const exampleData = parse('>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>');
example.equal(caveTopAfter(exampleData, 2022), 3068);
example.equal(caveTopAfter(exampleData, 1000000000000), 1514285714288);

const data = parse(load().lines[0]);
export default solve(
  () => caveTopAfter(data, 2022),
  () => caveTopAfter(data, 1000000000000)
).expect(3173, 1570930232582);
