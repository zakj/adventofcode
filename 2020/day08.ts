import { example, load, solve } from 'lib/advent';

enum Operator {
  Acc,
  Jmp,
  Nop,
}

type Instruction = {
  op: Operator;
  offset: number;
};

type Accumulator = number;
type Pointer = number;

type State = {
  acc: Accumulator;
  ptr: Pointer;
};

export type Maybe<T> = T | typeof Nothing;
export const Nothing = Symbol('Nothing');

function parseInstructions(lines: string[]): Instruction[] {
  const operators = {
    acc: Operator.Acc,
    jmp: Operator.Jmp,
    nop: Operator.Nop,
  };
  return lines.map((line) => {
    const [op, offset] = line.split(' ');
    return { op: operators[op], offset: Number(offset) };
  });
}

function operate(instr: Instruction, currentState: State): State {
  const state = { ...currentState };
  switch (instr.op) {
    case Operator.Nop:
      state.ptr++;
      break;
    case Operator.Acc:
      state.acc += instr.offset;
      state.ptr++;
      break;
    case Operator.Jmp:
      state.ptr += instr.offset;
      break;
  }
  return state;
}

function accumulatorValueBeforeLoop(instructions: Instruction[]): number {
  let state: State = { acc: 0, ptr: 0 };
  const visited = new Set();
  while (true) {
    if (visited.has(state.ptr)) return state.acc;
    visited.add(state.ptr);
    state = operate(instructions[state.ptr], state);
  }
}

function finalAccumulator(instructions: Instruction[]): Maybe<Accumulator> {
  let state: State = { acc: 0, ptr: 0 };
  const visited = new Set();
  while (true) {
    if (visited.has(state.ptr)) return Nothing;
    if (state.ptr >= instructions.length) return state.acc;
    visited.add(state.ptr);
    state = operate(instructions[state.ptr], state);
  }
}

function findAccumulatorAfterNonLoopingChange(
  instructions: Instruction[]
): Accumulator {
  const swaps = {
    [Operator.Jmp]: Operator.Nop,
    [Operator.Nop]: Operator.Jmp,
  };
  for (let i = 0; i < instructions.length; ++i) {
    const instr = instructions[i];
    if (instr.op in swaps) {
      const modifiedInstructions = [...instructions];
      modifiedInstructions[i] = { op: swaps[instr.op], offset: instr.offset };
      const result = finalAccumulator(modifiedInstructions);
      if (result !== Nothing) {
        return result;
      }
    }
  }
}

const exampleInstructions = parseInstructions(load('ex').lines);
example.equal(5, accumulatorValueBeforeLoop(exampleInstructions));
example.equal(8, findAccumulatorAfterNonLoopingChange(exampleInstructions));

const instructions = parseInstructions(load().lines);
export default solve(
  () => accumulatorValueBeforeLoop(instructions),
  () => findAccumulatorAfterNonLoopingChange(instructions)
).expect(1584, 920);
