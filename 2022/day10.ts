import { example, load, ocr, solve } from 'lib/advent';
import { Point, PointSet, toAscii } from 'lib/coords';

function parse(lines: string[]) {
  return lines.map((line) => {
    const [instr, arg] = line.split(' ');
    return { instr, arg: arg ? Number(arg) : null };
  });
}

type Instruction = { instr: string; arg: number };

function part1(instructions: Instruction[]) {
  let X = 1;
  let cycle = 1;
  const values = [0];
  const nextCycle = () => {
    values.push(X);
    cycle += 1;
  };
  for (const { instr, arg } of instructions) {
    if (instr === 'noop') nextCycle();
    else if (instr === 'addx') {
      nextCycle();
      nextCycle();
      X += arg;
    }
  }
  let sum = 0;
  for (let i = 20; i <= 220; i += 40) {
    // console.log({ cycle: i, X: values[i] });
    sum += i * values[i];
  }
  return sum;
}

function part2(instructions: Instruction[]) {
  let X = 1;
  let cycle = 0;
  const values = [];

  const iToP = (i: number): Point => {
    const y = Math.floor(i / 40);
    const x = i % 40;
    return { x, y };
  };

  const nextCycle = () => {
    values.push(X);
    // middle of 3px wide sprite is at X

    const pixel = iToP(cycle);
    const sprite = iToP(X);
    if (Math.abs(sprite.x - pixel.x) <= 1) {
      crt.add(pixel);
    }

    cycle += 1;
    cycle %= 240;
    console.log({ cycle, pixel, sprite, X });
  };

  const crt = new PointSet();
  for (const { instr, arg } of instructions) {
    if (instr === 'noop') nextCycle();
    else if (instr === 'addx') {
      nextCycle();
      nextCycle();
      X += arg;
    }
  }

  return crt;
}

const exampleData = parse(load('ex').lines);
example.equal(13140, part1(exampleData));
console.log(part2(exampleData));

const data = parse(load().lines);
// console.log(data);
export default solve(
  () => part1(data),
  () => ocr(toAscii(part2(data)), '4x6')
).expect(13740, 'ZUPRFECL');
