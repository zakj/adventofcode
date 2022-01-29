import { example, load, solve } from 'lib/advent';
import { DefaultDict } from 'lib/util';

type Snd = { op: 'snd'; args: [Value] };
type _Set = { op: 'set'; args: [Register, Value] };
type Add = { op: 'add'; args: [Register, Value] };
type Mul = { op: 'mul'; args: [Register, Value] };
type Mod = { op: 'mod'; args: [Register, Value] };
type Rcv = { op: 'rcv'; args: [Register] };
type Jgz = { op: 'jgz'; args: [Value, Value] };
type Instruction = Snd | _Set | Add | Mul | Mod | Rcv | Jgz;
type Register = string;
type Frequency = number;

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

function parse(lines: string[]): Instruction[] {
  return lines.map((line) => {
    const [op, ...args] = line.split(' ');
    let i = 0;
    const register = (): Register => args[i++];
    const value = (): Value => new Value(args[i++]);
    switch (op) {
      case 'snd':
        return { op, args: [value()] };
      case 'set':
        return { op, args: [register(), value()] };
      case 'add':
        return { op, args: [register(), value()] };
      case 'mul':
        return { op, args: [register(), value()] };
      case 'mod':
        return { op, args: [register(), value()] };
      case 'rcv':
        return { op, args: [register()] };
      case 'jgz':
        return { op, args: [value(), value()] };
    }
  });
}

function* execute(
  instructions: Instruction[],
  p?: number,
  snd?: Frequency[],
  rcv?: Frequency[]
): Generator<number> {
  const registers = new DefaultDict<Register, number>(() => 0);
  if (p != null) registers.set('p', p);
  let frequency: Frequency;
  let ptr = 0;
  let sendCount = 0;
  while (ptr >= 0 && ptr < instructions.length) {
    const instr = instructions[ptr];
    switch (instr.op) {
      case 'snd':
        snd.push(instr.args[0].get(registers));
        sendCount++;
        ptr++;
        break;
      case 'set':
        registers.set(instr.args[0], instr.args[1].get(registers));
        ptr++;
        break;
      case 'add':
        registers.set(
          instr.args[0],
          registers.get(instr.args[0]) + instr.args[1].get(registers)
        );
        ptr++;
        break;
      case 'mul':
        registers.set(
          instr.args[0],
          registers.get(instr.args[0]) * instr.args[1].get(registers)
        );
        ptr++;
        break;
      case 'mod':
        registers.set(
          instr.args[0],
          registers.get(instr.args[0]) % instr.args[1].get(registers)
        );
        ptr++;
        break;
      case 'rcv':
        while (rcv.length === 0) yield sendCount;
        registers.set(instr.args[0], rcv.shift());
        ptr++;
        break;
      case 'jgz':
        if (instr.args[0].get(registers) > 0)
          ptr += instr.args[1].get(registers);
        else ptr++;
        break;
    }
  }
}

function lastSentFrequency(instructions: Instruction[]): Frequency {
  const chan = [];
  execute(instructions, 0, chan, []).next();
  return chan.pop();
}

const exampleInstructions = parse(load('ex').lines);
example.equal(lastSentFrequency(exampleInstructions), 4);

const instructions = parse(load().lines);
export default solve(
  () => lastSentFrequency(instructions),
  () => {
    const chan0 = [];
    const chan1 = [];
    const p0 = execute(instructions, 0, chan0, chan1);
    const p1 = execute(instructions, 1, chan1, chan0);
    while (true) {
      const r0 = p0.next();
      const r1 = p1.next();
      if ((r0.done && r1.done) || (chan0.length === 0 && chan1.length === 0))
        return r1.value;
    }
  }
).expect(9423, 7620);
