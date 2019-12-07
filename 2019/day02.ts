import { loadDay } from './util';

const data = loadDay(2)
  .join('\n')
  .split(',')
  .map(x => parseInt(x, 10));

const EXIT = Symbol();
const OPERATIONS: {[key: number]: ((a: number, b: number) => number) | symbol} = {
  1: (a, b) => a + b,
  2: (a, b) => a * b,
  99: EXIT,
};

function intcode(instructions: number[], noun: number, verb: number) {
  const memory = instructions.slice();
  memory[1] = noun;
  memory[2] = verb;
  let cursor = 0;
  while (cursor < memory.length - 4) {
    const [opcode, in1, in2, out] = memory.slice(cursor, cursor + 4);
    const op = OPERATIONS[opcode];
    if (!op) throw new Error(`unknown opcode ${opcode} at index ${cursor}`);
    if (op === EXIT) break;
    if (typeof op === 'symbol') throw new Error()
    memory[out] = op(memory[in1], memory[in2]);
    cursor += 4;
  }
  return memory[0];
}

console.log(intcode(data, 12, 2));

for (let noun = 0; noun < data.length; ++noun) {
  for (let verb = 0; verb < data.length; ++verb) {
    // TODO break
    if (intcode(data, noun, verb) === 19690720)
      console.log(`${100 * noun + verb} (${noun} ${verb})`);
  }
}
