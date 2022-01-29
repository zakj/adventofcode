import { example, load, solve } from '../advent';
import { sum } from '../util';

type Registers = number[];
type Instruction = [string, number, number, number];
type OpFn = (r: Registers, a: number, b: number) => number;
type Ops = Record<string, OpFn>;

const ops: Ops = {
  addr: (r, a, b) => r[a] + r[b],
  addi: (r, a, b) => r[a] + b,
  mulr: (r, a, b) => r[a] * r[b],
  muli: (r, a, b) => r[a] * b,
  banr: (r, a, b) => r[a] & r[b],
  bani: (r, a, b) => r[a] & b,
  borr: (r, a, b) => r[a] | r[b],
  bori: (r, a, b) => r[a] | b,
  setr: (r, a, b) => r[a],
  seti: (r, a, b) => a,
  gtir: (r, a, b) => (a > r[b] ? 1 : 0),
  gtri: (r, a, b) => (r[a] > b ? 1 : 0),
  gtrr: (r, a, b) => (r[a] > r[b] ? 1 : 0),
  eqir: (r, a, b) => (a == r[b] ? 1 : 0),
  eqri: (r, a, b) => (r[a] == b ? 1 : 0),
  eqrr: (r, a, b) => (r[a] == r[b] ? 1 : 0),
};

function parse(lines: string[]): {
  ptrRegister: number;
  program: Instruction[];
} {
  const ptrRegister = Number(lines.shift().split(' ')[1]);
  return {
    ptrRegister,
    program: lines.map(
      (line) =>
        line
          .split(' ')
          .map((word, i) => (i > 0 ? Number(word) : word)) as Instruction
    ),
  };
}

function execute(
  ptrRegister: number,
  program: Instruction[],
  reg0: number = 0
): Registers {
  const registers = [reg0, 0, 0, 0, 0, 0];
  let ptr = 0;
  while (ptr in program) {
    registers[ptrRegister] = ptr;
    const [op, a, b, c] = program[ptr];
    registers[c] = ops[op](registers, a, b);
    ptr = registers[ptrRegister];
    ptr++;
  }
  return registers;
}

function factorsOf(n: number): number[] {
  const factors = [];
  for (let i = 1; i <= n; ++i) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
}

const exInput = parse(load('ex').lines);
example.equal(execute(exInput.ptrRegister, exInput.program)[0], 6);

const input = parse(load().lines);
export default solve(
  () => execute(input.ptrRegister, input.program)[0],
  () => sum(factorsOf(10551387))
).expect(1536, 17540352);

/*

sum of factors of R4 after INIT

#ip 2
|  n   | instruction |                           |                      |
| ---: | ----------- | ------------------------- | -------------------- |
|    0 | addi 2 16 2 | GOTO 17                   |                      |
|      |             |                           |                      |
| MAIN |             |                           |                      |
|    1 | seti 1 0 1  | R1 = 1                    | R1 = 1               |
|      |             |                           | while (R5 < R4)      |
|    2 | seti 1 3 3  | R3 = 1                    | R3 = 1               |
|    3 | mulr 1 3 5  | R5 = R1 * R3              | R5 = R1 * R3         |
|      |             |                           |                      |
|    4 | eqrr 5 4 5  | R5 = R5 == R4 ? 1 : 0     | if (R5 === R4) R0++  |
|    5 | addr 5 2 2  | GOTO R5 + 5 + 1  (6 or 7) |                      |
|    6 | addi 2 1 2  | GOTO 6 + 1 + 1  (8)       |                      |
|    7 | addr 1 0 0  | R0 += R1                  | answer += R1         |
|      |             |                           |                      |
|    8 | addi 3 1 3  | R3 += 1                   | R3++                 |
|      |             |                           |                      |
|    9 | gtrr 3 4 5  | R5 = R3 > R4 ? 1 : 0      | if (R3 <= R4) GOTO 3 |
|   10 | addr 2 5 2  | GOTO 10 + R5 + 1          | GOTO 11 or 12        |
|   11 | seti 2 6 2  | GOTO 2 + 1                | GOTO 3               |
|      |             |                           |                      |
|   12 | addi 1 1 1  | R1 += 1                   |                      |
|   13 | gtrr 1 4 5  | R5 = R1 > R4 ? 1 : 0      |                      |
|      |             |                           |                      |
|   14 | addr 5 2 2  | GOTO R5 + 14 + 1          | GOTO 15 or 16        |
|   15 | seti 1 1 2  | GOTO 1 + 1                | GOTO 2               |
|   16 | mulr 2 2 2  | GOTO 16 * 16 + 1 = 257    | END                  |
|      |             |                           |                      |
| INIT |             |                           |                      |
|   17 | addi 4 2 4  | R4 += 2                   | R4 = 2               |
|   18 | mulr 4 4 4  | R4 *= R4                  | R4 = 4               |
|   19 | mulr 2 4 4  | R4 *= 19                  | R4 = 76              |
|   20 | muli 4 11 4 | R4 *= 11                  | R4 = 836             |
|   21 | addi 5 6 5  | R5 += 6                   | R5 = 6               |
|   22 | mulr 5 2 5  | R5 *= 22                  | R5 = 132             |
|   23 | addi 5 19 5 | R5 += 19                  | R5 = 151             |
|   24 | addr 4 5 4  | R4 += R5 (151)            | R4 = 987             |
|      |             |                           |                      |
|   25 | addr 2 0 2  | GOTO 25 + R0 + 1          | GOTO 27 for part2    |
|   26 | seti 0 7 2  | GOTO 0 + 1                | GOTO 1 for part1     |
|      |             |                           |                      |
|   27 | setr 2 6 5  | R5 = 27                   |                      |
|   28 | mulr 5 2 5  | R5 *= 28                  |                      |
|   29 | addr 2 5 5  | R5 += 29                  |                      |
|   30 | mulr 2 5 5  | R5 *= 30                  |                      |
|   31 | muli 5 14 5 | R5 *= 14                  |                      |
|   32 | mulr 5 2 5  | R5 *= 32                  | R5 = 10550400        |
|   33 | addr 4 5 4  | R4 += R5                  | R4 = 10551387        |
|   34 | seti 0 7 0  | R0 =0                     |                      |
|   35 | seti 0 3 2  | GOTO 0 + 1                |                      |

*/
