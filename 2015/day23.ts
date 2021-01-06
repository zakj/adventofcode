import { answers, load } from "./advent";

type Registers = {
  a: bigint;
  b: bigint;
};

type Instruction = {
  type: 'hlf' | 'tpl' | 'inc' | 'jmp' | 'jie' | 'jio';
  reg?: keyof Registers;
  offset?: number;
};

function parse(lines: string[]): Instruction[] {
  return lines.map(line => {
    const [type, ...rest] = line.split(' ')
    let reg, offset;
    let arg = rest.shift();
    if (['a', 'b'].includes(arg[0])) {
      reg = arg[0] as Instruction['reg'];
    }
    else {
      offset = Number(arg)
    }
    if (rest.length) {
      offset = Number(rest.shift())
    }
    return {
      type: type as Instruction['type'],
      reg: reg,
      offset,
    };
  })
}

function compute(instructions: Instruction[], registerA: bigint = 0n): Registers {
  const registers: Registers = { a: registerA, b: 0n };
  let ctr: number = 0;
  while (ctr < instructions.length) {
    const instr = instructions[ctr];
    switch (instr.type) {
      case 'hlf':
        registers[instr.reg] /= 2n;
        ctr++;
        break;
      case 'tpl':
        registers[instr.reg] *= 3n;
        ctr++;
        break;
      case 'inc':
        registers[instr.reg] += 1n;
        ctr++;
        break;
      case 'jmp':
        ctr += instr.offset;
        break;
      case 'jie':
        const reg = registers[instr.reg].toString().split('');  // ugh js
        if (Number(reg[reg.length - 1]) % 2 === 0) ctr += instr.offset;
        else ctr++;
        break;
      case 'jio':
        if (registers[instr.reg] === 1n) ctr += instr.offset;
        else ctr++;
        break;
    }
  }
  return registers;
}

const instructions = parse(load(23).lines)
answers(
  () => compute(instructions).b,
  () => compute(instructions, 1n).b
)
