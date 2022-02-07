import { DefaultDict } from 'lib/collections';

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
type StandardInstruction = Cpy | Inc | Dec | Jnz | Tgl | Out;

type Add = {
  type: 'add';
  to: Register;
  from: Register;
};
type Mlt = {
  type: 'mlt';
  to: Register;
  from1: Value | Register;
  from2: Register;
  tmp: Register;
};
type OptimizedInstruction = Add | Mlt;

type Registers = Map<Register, number>;
type ParseResult = {
  instructions: StandardInstruction[];
  optimized: Map<number, OptimizedInstruction>;
};

const isValue = (v: Value | Register): v is Value => typeof v === 'number';
const isRegister = (v: string): v is Register =>
  ['a', 'b', 'c', 'd'].includes(v);
const valueOf = (v: Value | Register, registers: Registers): number =>
  isValue(v) ? v : registers.get(v);

export function parse(lines: string[]): ParseResult {
  const asRegister = (v: string): Register => v as Register;
  const asValue = (v: string): Value => Number(v);
  const valueOrRegister = (v: string): Value | Register =>
    isRegister(v) ? asRegister(v) : asValue(v);
  let hasTgl = false;
  const optimized = new Map<number, OptimizedInstruction>();
  const instructions = lines.map((line) => {
    const args = line.split(' ');
    const type = args.shift() as StandardInstruction['type'];
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
        hasTgl = true;
        return { type, arg1: valueOrRegister(args[0]) };
      case 'out':
        return { type, arg1: asRegister(args[0]) };
    }
  });
  if (!hasTgl) {
    // tgl operation changes the instructions in flight, so we can't pre-optimize.
    instructions.forEach((instr, i) => {
      const opt = optimize(instructions, i);
      if (opt) optimized.set(i, opt);
    });
  }
  return { instructions, optimized };
}

export function* executeSignals(
  { instructions, optimized }: ParseResult,
  regInit: [Register, Value][] = []
): Generator<Signal, Registers> {
  const registers = new DefaultDict<Register, Value>(() => 0);
  regInit.forEach(([reg, val]) => registers.set(reg, val));
  let i = 0;
  instructions = [...instructions];
  while (i < instructions.length) {
    const instr =
      (optimized.size ? optimized.get(i) : optimize(instructions, i)) ||
      instructions[i];
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
      case 'tgl': {
        const targetIndex = i + valueOf(instr.arg1, registers);
        const target = instructions[targetIndex];
        if (target) {
          let toggled: StandardInstruction;
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
      }
      case 'out':
        yield registers.get(instr.arg1);
        ++i;
        break;
      case 'add':
        registers.set(
          instr.to,
          registers.get(instr.to) + registers.get(instr.from)
        );
        registers.set(instr.from, 0);
        i += 3;
        break;
      case 'mlt': {
        const [from, a, b] = [
          registers.get(instr.to),
          valueOf(instr.from1, registers),
          registers.get(instr.from2),
        ];
        registers.set(instr.to, from + a * b);
        registers.set(instr.from2, 0);
        registers.set(instr.tmp, 0);
        i += 6;
        break;
      }
    }
  }
  return registers;
}

export function execute(
  parsed: ParseResult,
  regInit: [Register, Value][] = []
): Registers {
  const rv = executeSignals(parsed, regInit).next();
  if (!rv.done) throw new Error('executeSignals failed to complete');
  return rv.value;
}

function optimize(
  instructions: StandardInstruction[],
  i: number
): OptimizedInstruction {
  const instr = instructions[i];
  if (instr.type === 'inc') {
    // inc target, dec x, jnz x -2
    // target += x; x = 0
    const [a, b, c] = instructions.slice(i, i + 3);
    if (
      a.type === 'inc' &&
      b.type === 'dec' &&
      c.type === 'jnz' &&
      c.arg2 === -2 &&
      b.arg1 === c.arg1
    )
      return { type: 'add', to: a.arg1, from: b.arg1 };
  } else if (instr.type === 'cpy') {
    // cpy x tmp, inc target, dec tmp, jnz tmp -2, dec y, jnz y -5
    // target += x * y; tmp = 0; y = 0
    const [a, b, c, d, e, f] = instructions.slice(i, i + 6);
    if (
      a.type === 'cpy' &&
      b.type === 'inc' &&
      c.type === 'dec' &&
      d.type === 'jnz' &&
      e.type === 'dec' &&
      f.type === 'jnz' &&
      d.arg2 === -2 &&
      f.arg2 === -5
    )
      return {
        type: 'mlt',
        to: b.arg1,
        from1: a.arg1,
        from2: e.arg1,
        tmp: c.arg1,
      };
  }
  return;
}
