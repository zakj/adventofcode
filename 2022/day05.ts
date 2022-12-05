import { example, load, solve } from 'lib/advent';

function parse(paragraphs: string[]): [Boxes, Procedure[]] {
  const boxesInput = paragraphs[0].split('\n');
  const procedure = paragraphs[1].split('\n').map((line) => {
    const [count, from, to] = line.match(/[0-9]+/g).map(Number);
    return { count, from, to };
  });

  const numIndexes = new Map(
    boxesInput[boxesInput.length - 1].split('').map((x, i) => [i, Number(x)])
  );
  const boxes: Record<number, string[]> = {};
  boxesInput.slice(0, boxesInput.length - 1).forEach((line) => {
    line.split('').forEach((x, i) => {
      if (!/[A-Z]/.test(x)) return;
      const stack = numIndexes.get(i);
      if (!boxes[stack]) boxes[stack] = [];
      boxes[stack].unshift(x);
    });
  });
  return [boxes, procedure];
}

type Boxes = Record<number, string[]>;
type Procedure = { from: number; to: number; count: number };

function part1(boxes: Boxes, procedure: Procedure[]) {
  for (const p of procedure) {
    for (let i = 0; i < p.count; ++i) {
      const box = boxes[p.from].pop();
      boxes[p.to].push(box);
    }
  }
  return Object.values(boxes)
    .map((stack) => stack.pop())
    .join('');
}

function part2(boxes: Boxes, procedure: Procedure[]) {
  for (const p of procedure) {
    const moving = [];
    for (let i = 0; i < p.count; ++i) {
      const box = boxes[p.from].pop();
      console.log('TO MOVE', box);
      moving.unshift(box);
    }
    for (const b of moving) {
      boxes[p.to].push(b);
    }
    console.log({ boxes, moving });
  }
  return Object.values(boxes)
    .map((stack) => stack.pop())
    .join('');
}

const exampleData = parse(
  `    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`.split('\n\n')
);
example.equal('CMZ', part1(...exampleData));
const exampleData2 = parse(
  `    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`.split('\n\n')
);
example.equal('MCD', part2(...exampleData2));

const data = parse(load().raw.trim().split('\n\n'));
const data2 = parse(load().raw.trim().split('\n\n'));

export default solve(
  () => part1(...data),
  () => part2(...data2)
).expect('VGBBJCRMN', 'LBBVJBRMH');
