import { answers, example, load } from '../advent';

function jumpsToExit(
  instructions: number[],
  incr: (n: number) => number
): number {
  instructions = [...instructions];
  let ptr = 0;
  let jumps = 0;
  while (ptr < instructions.length) {
    const cur = ptr;
    ptr += instructions[ptr];
    instructions[cur] = incr(instructions[cur]);
    jumps++;
  }
  return jumps;
}

const part1 = (n: number): number => n + 1;
const part2 = (n: number): number => (n >= 3 ? n - 1 : n + 1);

example.equal(jumpsToExit([0, 3, 0, 1, -3], part1), 5);
example.equal(jumpsToExit([0, 3, 0, 1, -3], part2), 10);

const instructions = load(5).numbers;
answers.expect(376976, 29227751);
answers(
  () => jumpsToExit(instructions, part1),
  () => jumpsToExit(instructions, part2)
);
