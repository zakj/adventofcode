import { answers, example, load } from './advent';
import { DefaultDict } from './util';

type Instruction = {
  type: 'cpy' | 'inc' | 'dec' | 'jnz';
  args: (string | number)[];
};

type Registers = Map<string, number>;

function parse(lines: string[]): Instruction[] {
  return lines.map((line) => {
    const words = line.split(' ');
    const type = words.shift() as Instruction['type'];
    return {
      type,
      args: words.map((w) => (isNaN(Number(w)) ? w : Number(w))),
    };
  });
}

function value(v: number | string, registers: Registers): number {
  return typeof v === 'number' ? v : registers.get(v);
}

function process(
  instructions: Instruction[],
  regInit: [string, number][] = []
): Registers {
  const registers = new DefaultDict<string, number>(() => 0);
  regInit.forEach(([reg, val]) => registers.set(reg, val));
  let i = 0;
  while (i < instructions.length) {
    const instr = instructions[i];
    switch (instr.type) {
      case 'cpy':
        registers.set(instr.args[1] as string, value(instr.args[0], registers));
        ++i;
        break;
      case 'inc':
        registers.set(
          instr.args[0] as string,
          registers.get(instr.args[0] as string) + 1
        );
        ++i;
        break;
      case 'dec':
        registers.set(
          instr.args[0] as string,
          registers.get(instr.args[0] as string) - 1
        );
        ++i;
        break;
      case 'jnz':
        if (value(instr.args[0], registers) !== 0) i += instr.args[1] as number;
        else ++i;
        break;
    }
  }
  return registers;
}

const exampleInstructions = parse(load(12, 'ex').lines);
example.equal(process(exampleInstructions).get('a'), 42);

const instructions = parse(load(12).lines);
answers(
  () => process(instructions).get('a'),
  () => process(instructions, [['c', 1]]).get('a')
);
