import { main } from 'lib/advent';
import { DefaultDict } from 'lib/collections';
import { lines } from 'lib/util';

type Register = string;
type Expression = string;
type Instruction = {
  register: Register;
  op: 'inc' | 'dec';
  value: number;
  expression: Expression;
};
type Registers = Map<Register, number>;

function parse(s: string): Instruction[] {
  return lines(s).map((line) => {
    const [register, op, val, , ...expression] = line.split(/\s+/);
    if (op !== 'inc' && op !== 'dec') throw new Error();
    return {
      register,
      op,
      value: Number(val),
      expression: expression.join(' '),
    };
  });
}

const operations = new Map<string, (a: number, b: number) => boolean>([
  ['>', (a, b) => a > b],
  ['<', (a, b) => a < b],
  ['>=', (a, b) => a >= b],
  ['<=', (a, b) => a <= b],
  ['==', (a, b) => a === b],
  ['!=', (a, b) => a !== b],
]);

function evaluate(exp: Expression, registers: Registers): boolean {
  const [reg, op, value] = exp.split(/\s+/);
  return operations.get(op)(registers.get(reg), Number(value));
}

function execute(instructions: Instruction[]) {
  let max = -Infinity;
  const registers = new DefaultDict<Register, number>(() => 0);
  for (const instr of instructions) {
    if (evaluate(instr.expression, registers)) {
      const val =
        registers.get(instr.register) +
        instr.value * (instr.op === 'inc' ? 1 : -1);
      max = Math.max(max, val);
      registers.set(instr.register, val);
    }
  }
  return { currentMax: Math.max(...registers.values()), historicalMax: max };
}

main(
  (s) => execute(parse(s)).currentMax,
  (s) => execute(parse(s)).historicalMax
);
