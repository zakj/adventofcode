import { DefaultDict, range } from '../util';

type Register = 'a' | 'b' | 'c' | 'd';
type Value = number;
type Signal = number;

type Cpy = {
  type: 'cpy';
  arg1: Value | Register;
  arg2: Value | Register; // only Register is valid, union is for toggling
};
type Inc = {
  type: 'inc';
  arg1: Register;
};
type Dec = {
  type: 'dec';
  arg1: Register;
};
type Jnz = {
  type: 'jnz';
  arg1: Value | Register;
  arg2: Value | Register;
};
type Tgl = {
  type: 'tgl';
  arg1: Value | Register;
};
type Out = {
  type: 'out';
  arg1: Register;
};

type Instruction = Cpy | Inc | Dec | Jnz | Tgl | Out;
type Registers = Map<Register, number>;

const isValue = (v: Value | Register): v is Value => typeof v === 'number';
const isRegister = (v: string): v is Register =>
  ['a', 'b', 'c', 'd'].includes(v);
const valueOf = (v: Value | Register, registers: Registers): number =>
  isValue(v) ? v : registers.get(v);

export function parse(lines: string[]): Instruction[] {
  const asRegister = (v: string): Register => v as Register;
  const asValue = (v: string): Value => Number(v);
  const valueOrRegister = (v: string): Value | Register =>
    isRegister(v) ? asRegister(v) : asValue(v);
  return lines.map((line) => {
    const args = line.split(' ');
    const type = args.shift() as Instruction['type'];
    switch (type) {
      case 'cpy':
        return {
          type,
          arg1: valueOrRegister(args[0]),
          arg2: asRegister(args[1]),
        };
      case 'inc':
        return { type, arg1: asRegister(args[0]) };
      case 'dec':
        return { type, arg1: asRegister(args[0]) };
      case 'jnz':
        return {
          type,
          arg1: valueOrRegister(args[0]),
          arg2: valueOrRegister(args[1]),
        };
      case 'tgl':
        return { type, arg1: valueOrRegister(args[0]) };
      case 'out':
        return { type, arg1: asRegister(args[0]) };
    }
  });
}

export function* executeSignals(
  instructions: Instruction[],
  regInit: [Register, Value][] = []
): Generator<Signal, Registers> {
  const registers = new DefaultDict<Register, Value>(() => 0);
  regInit.forEach(([reg, val]) => registers.set(reg, val));
  let i = 0;
  instructions = [...instructions];
  while (i < instructions.length) {
    const optSkips = optimize(instructions, i, registers);
    if (optSkips) {
      i += optSkips;
      continue;
    }
    const instr = instructions[i];
    switch (instr.type) {
      case 'cpy':
        if (!isValue(instr.arg2)) {
          registers.set(instr.arg2, valueOf(instr.arg1, registers));
        }
        ++i;
        break;
      case 'inc':
        registers.set(instr.arg1, registers.get(instr.arg1) + 1);
        ++i;
        break;
      case 'dec':
        registers.set(instr.arg1, registers.get(instr.arg1) - 1);
        ++i;
        break;
      case 'jnz':
        if (valueOf(instr.arg1, registers) !== 0) {
          i += valueOf(instr.arg2, registers);
        } else {
          ++i;
        }
        break;
      case 'tgl':
        const targetIndex = i + valueOf(instr.arg1, registers);
        const target = instructions[targetIndex];
        if (target) {
          let toggled: Instruction;
          if (['inc', 'dec', 'tgl'].includes(target.type)) {
            toggled = {
              type: target.type === 'inc' ? 'dec' : 'inc',
              arg1: target.arg1,
            } as Inc | Dec;
          } else if (target.type === 'cpy' || target.type == 'jnz') {
            toggled = {
              type: target.type === 'cpy' ? 'jnz' : 'cpy',
              arg1: target.arg1,
              arg2: target.arg2,
            } as Cpy | Jnz;
          }
          instructions[targetIndex] = toggled;
        }
        ++i;
        break;
      case 'out':
        yield registers.get(instr.arg1);
        ++i;
        break;
    }
  }
  return registers;
}

export function execute(
  instructions: Instruction[],
  regInit: [Register, Value][] = [],
  maxIterations: number = 1
): Registers {
  let iterations = 0;
  let rv: IteratorResult<number, Registers>;
  const it = executeSignals(instructions, regInit);
  for (let i = 0; i < maxIterations; ++i) {
    rv = it.next();
    if (rv.done) break;
  }
  if (!rv.done) throw new Error('reached maxIterations');
  return rv.value;
}

function optimize(
  instructions: Instruction[],
  i: number,
  registers: Registers
): number {
  type Add = [Inc, Dec, Jnz];
  type Mlt = [Cpy, Inc, Dec, Jnz, Dec, Jnz];
  const optimizations = {
    add: ['inc', 'dec', 'jnz'],
    mlt: ['cpy', 'inc', 'dec', 'jnz', 'dec', 'jnz'],
  };
  const optim = Object.entries(optimizations).find(([name, ops]) => {
    if (range(0, ops.length).some((j) => instructions[i + j].type !== ops[j]))
      return false;
    if (name === 'add') {
      // inc target, dec x, jnz x -2
      // target += x
      const [a, b, c] = instructions.slice(i, i + ops.length) as Add;
      if (b.arg1 !== c.arg1 || valueOf(c.arg2, registers) !== -2) return false;
      registers.set(a.arg1, registers.get(a.arg1) + valueOf(b.arg1, registers));
      registers.set(b.arg1, 0);
      return true;
    }
    if (name === 'mlt') {
      // cpy x tmp, inc target, dec tmp, jnz tmp -2, dec y, jnz y - 5
      // target += x * y
      const [a, b, , d, e, f] = instructions.slice(i, i + ops.length) as Mlt;
      const [op1, tmpReg, target, op2] = [a.arg1, a.arg2, b.arg1, e.arg1];
      // TODO not comprehensive OR pretty
      if (d.arg2 !== -2 || f.arg2 !== -5) return false;
      registers.set(
        target,
        registers.get(target) +
          valueOf(op1, registers) * valueOf(op2, registers)
      );
      registers.set(tmpReg as Register, 0);
      registers.set(op2 as Register, 0);
      return true;
    }
  });
  return optim?.[1].length || 0;
}
