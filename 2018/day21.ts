import { load, solve } from 'lib/advent';

type Registers = number[];
type Instruction = [string, number, number, number];
type OpFn = (r: Registers, a: number, b: number) => number;
type Ops = Record<string, OpFn>;

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

function* execute(
  ptrRegister: number,
  program: Instruction[]
): Generator<number> {
  const registers = [0, 0, 0, 0, 0, 0];
  let ptr = 0;
  while (ptr in program) {
    registers[ptrRegister] = ptr;
    const [op, a, b, c] = program[ptr];
    if (ptr === 28) {
      yield registers[1];
    }
    registers[c] = ops[op](registers, a, b);
    ptr = registers[ptrRegister];
    ptr++;
  }
}

const input = parse(load().lines);
export default solve(
  () => execute(input.ptrRegister, input.program).next().value,
  () => {
    // TODO: optimize. this is kind of ridiculous (2+ minutes)
    const history = new Set();
    let last = 0;
    for (const reg1 of execute(input.ptrRegister, input.program)) {
      if (history.has(reg1)) return last;
      last = reg1;
      history.add(reg1);
    }
  }
).expect(11592302, 313035);

// incomplete and probably incorrect so far :/
function* optimized(): Generator<number> {
  let r1 = 0;
  let r2 = 0;
  while (true) {
    r1 |= 65536;
    r2 = 10605201;
    while (r2 >= 256) {
      r1 += r2 & 255;
      r1 &= 16777215;
      r1 *= 65899;
      r1 &= 16777215;
      r2 = Math.floor(r2 / 256);
    }
    yield r1;
  }
}

/*

#ip 3
|      |    instruction    |     translation     |         notes          |
| ---: | ----------------- | ------------------- | ---------------------- |
|    0 | seti 123 0 1      | R1 = 123            |                        |
|    1 | bani 1 456 1      | R1 &= 456           |                        |
|      |                   |                     |                        |
|    2 | eqri 1 72 1       | if R1 == 72         |                        |
|    3 | addr 1 3 3        | . GOTO 5            |                        |
|    4 | seti 0 0 3        | else GOTO 1         | all noops above here?? |
|      |                   |                     |                        |
|    5 | seti 0 0 1        | R1 = 0              |                        |
|    6 | bori 1 65536 2    | R2 = R1 ^ 65536     |                        |
|    7 | seti 10605201 9 1 | R1 = 10605201       | magic number?          |
|      |                   |                     |                        |
|    8 | bani 2 255 5      | R5 = R2 & 255       | start of main loop     |
|    9 | addr 1 5 1        | R1 += R5            |                        |
|   10 | bani 1 16777215 1 | R1 &= 16777215      |                        |
|   11 | muli 1 65899 1    | R1 *= 65899         |                        |
|   12 | bani 1 16777215 1 | R1 &= 16777215      |                        |
|      |                   |                     |                        |
|   13 | gtir 256 2 5      | if 256 > R2         |                        |
|   14 | addr 5 3 3        | . GOTO 16 (GOTO 28) |                        |
|   15 | addi 3 1 3        | else GOTO 17        |                        |
|   16 | seti 27 3 3       | GOTO 28             |                        |
|      |                   |                     |                        |
|   17 | seti 0 3 5        | R5 = 0              |                        |
|   18 | addi 5 1 4        | R4 = R5 + 1         |                        |
|   19 | muli 4 256 4      | R4 *= 256           |                        |
|      |                   |                     |                        |
|   20 | gtrr 4 2 4        | if R4 > R2          |                        |
|   21 | addr 4 3 3        | . GOTO 23 (GOTO 26) |                        |
|   22 | addi 3 1 3        | else GOTO 24        |                        |
|   23 | seti 25 3 3       | GOTO 26             |                        |
|      |                   |                     |                        |
|   24 | addi 5 1 5        | R5++                |                        |
|   25 | seti 17 5 3       | GOTO 18             |                        |
|   26 | setr 5 5 2        | R2 = R5             |                        |
|   27 | seti 7 6 3        | GOTO 8              |                        |
|      |                   |                     |                        |
|   28 | eqrr 1 0 5        | if R0 == R1         |                        |
|   29 | addr 5 3 3        | . END               |                        |
|   30 | seti 5 8 3        | else GOTO 9         |                        |

*/
