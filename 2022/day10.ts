import { example, load, ocr, solve } from 'lib/advent';
import { Point, PointSet, toAscii } from 'lib/coords';
import { Iter, iter } from 'lib/iter';

function parse(lines: string[]) {
  return lines.map((line) => {
    const [instr, arg] = line.split(' ');
    return { instr, arg: arg ? Number(arg) : null };
  });
}

type Instruction = { instr: string; arg: number };
type Cycle = { cycle: number; X: number };
type CRT = PointSet;

function registerValues(instructions: Instruction[]): Iter<Cycle> {
  return iter(instructions)
    .scan(
      (prev, { instr, arg }) => {
        const X = prev[prev.length - 1];
        return [X, ...(instr === 'addx' ? [X + arg] : [])];
      },
      [1]
    )
    .flat()
    .map((X, i) => ({ X, cycle: i + 1 }));
}

function signalStrengths(instructions: Instruction[]): number {
  return registerValues(instructions)
    .filter(({ cycle }) => (cycle % 40) - 20 === 0)
    .map(({ X, cycle }) => X * cycle)
    .sum();
}

function drawCrt(instructions: Instruction[]): CRT {
  const toPoint = (i: number): Point => ({ x: i % 40, y: Math.floor(i / 40) });

  return registerValues(instructions).reduce((crt, { cycle, X }) => {
    const pixel = toPoint(cycle - 1);
    const sprite = toPoint(X);
    if (Math.abs(sprite.x - pixel.x) <= 1) crt.add(pixel);
    return crt;
  }, new PointSet());
}

const exampleData = parse(load('ex').lines);
example.equal(13140, signalStrengths(exampleData));
// console.log(toAscii(drawCrt(exampleData)));

const data = parse(load().lines);
export default solve(
  () => signalStrengths(data),
  () => ocr(toAscii(drawCrt(data)), '4x6')
).expect(13740, 'ZUPRFECL');
