import { main } from 'lib/advent';
import { paragraphs, range } from 'lib/util';
import { isDeepStrictEqual } from 'util';

type Registers = number[];
type Instruction = number[];
type TestCase = {
  before: Registers;
  after: Registers;
  instruction: Instruction;
};
type OpFn = (r: Registers, a: number, b: number) => number;
type Ops = Record<string, OpFn>;
type OpCodes = Map<number, string>;

function parse(s: string): {
  testCases: TestCase[];
  program: Instruction[];
} {
  const paras = paragraphs(s);
  const program = paras.pop().map((line) => line.split(/\s+/).map(Number));
  const testCases = paras.map((para) => {
    const before = para[0].split(/[[\]]/)[1].split(', ').map(Number);
    const after = para[2].split(/[[\]]/)[1].split(', ').map(Number);
    const instruction = para[1].split(/\s+/).map(Number);
    return { before, after, instruction };
  });
  return { testCases, program };
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

function validOps(testCase: TestCase): string[] {
  const [op, a, b, c] = testCase.instruction;
  const valid = [];
  for (const [name, op] of Object.entries(ops)) {
    const registers = [...testCase.before];
    registers[c] = op(registers, a, b);
    if (isDeepStrictEqual(registers, testCase.after)) valid.push(name);
  }
  return valid;
}

function determineOpCodes(testCases: TestCase[]): OpCodes {
  const possibles = new Map<number, Set<string>>();
  const opNames = new Set(Object.keys(ops));
  range(0, 16).forEach((i) => possibles.set(i, new Set(opNames)));
  for (const c of testCases) {
    const valid = new Set(validOps(c));
    for (const name of opNames) {
      if (!valid.has(name)) possibles.get(c.instruction[0]).delete(name);
    }
  }
  while ([...possibles.values()].some((p) => p.size > 1)) {
    const known = [];
    possibles.forEach((p) => (p.size === 1 ? known.push([...p].pop()) : null));
    for (const name of known) {
      possibles.forEach((p) => (p.size > 1 ? p.delete(name) : null));
    }
  }
  return new Map([...possibles.entries()].map(([k, v]) => [k, [...v].pop()]));
}

function execute(program: Instruction[], opCodes: OpCodes): Registers {
  const registers = [0, 0, 0, 0];
  for (const [op, a, b, c] of program) {
    registers[c] = ops[opCodes.get(op)](registers, a, b);
  }
  return registers;
}

main(
  (s) => parse(s).testCases.filter((c) => validOps(c).length >= 3).length,
  (s) => {
    const { testCases, program } = parse(s);
    const opCodes = determineOpCodes(testCases);
    return execute(program, opCodes)[0];
  }
);
