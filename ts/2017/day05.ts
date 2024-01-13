import { main } from 'lib/advent';
import { allNumbers } from 'lib/util';

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

main(
  (s) => jumpsToExit(allNumbers(s), part1),
  (s) => jumpsToExit(allNumbers(s), part2)
);
