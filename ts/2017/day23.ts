import { main } from 'lib/advent';
import { DefaultDict } from 'lib/collections';
import { lines } from 'lib/util';

type _Set = { op: 'set'; args: [Register, Value] };
type Sub = { op: 'sub'; args: [Register, Value] };
type Mul = { op: 'mul'; args: [Register, Value] };
type Jnz = { op: 'jnz'; args: [Value, Value] };
type Instruction = _Set | Sub | Mul | Jnz;
type Register = string;
type Registers = Map<string, number>;

class Value {
  private register: string;
  private _value: number;

  constructor(s: string) {
    const n = Number(s);
    if (isNaN(n)) {
      this.register = s;
    }
    this._value = n;
  }

  get(registers: Map<string, number>): number {
    if (this.register) return registers.get(this.register);
    return this._value;
  }

  get [Symbol.toStringTag]() {
    return this.register || this._value.toString();
  }
}

function parse(s: string): Instruction[] {
  return lines(s).map((line) => {
    const [op, ...args] = line.split(' ');
    let i = 0;
    const register = (): Register => args[i++];
    const value = (): Value => new Value(args[i++]);
    switch (op) {
      case 'set':
        return { op, args: [register(), value()] };
      case 'sub':
        return { op, args: [register(), value()] };
      case 'mul':
        return { op, args: [register(), value()] };
      case 'jnz':
        return { op, args: [value(), value()] };
    }
  });
}

function execute(
  instructions: Instruction[],
  debug = false
): { mulCount: number; registers: Registers } {
  const registers = new DefaultDict<Register, number>(() => 0);
  if (debug) registers.set('a', 1);
  let ptr = 0;
  let mulCount = 0;
  while (ptr >= 0 && ptr < instructions.length) {
    const instr = instructions[ptr];
    switch (instr.op) {
      case 'set':
        registers.set(instr.args[0], instr.args[1].get(registers));
        ptr++;
        break;
      case 'sub':
        registers.set(
          instr.args[0],
          registers.get(instr.args[0]) - instr.args[1].get(registers)
        );
        ptr++;
        break;
      case 'mul':
        mulCount++;
        registers.set(
          instr.args[0],
          registers.get(instr.args[0]) * instr.args[1].get(registers)
        );
        ptr++;
        break;
      case 'jnz':
        if (instr.args[0].get(registers) !== 0)
          ptr += instr.args[1].get(registers);
        else ptr++;
        break;
    }
  }
  return { mulCount, registers };
}

main(
  (s) => execute(parse(s)).mulCount,
  (s) => {
    const arg = (i: number) => parse(s)[i].args[1].get(null);
    const b = arg(0) * arg(4) - arg(5);
    const c = b - arg(7);
    let h = 0;
    for (let i = b; i <= c; i += 17) {
      for (let j = 2; j < i; ++j) {
        if (i % j === 0) {
          h++;
          break;
        }
      }
    }
    return h;
  }
);
