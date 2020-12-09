import { access } from 'fs/promises';
import { example, loadDayLines } from './util';

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
}

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

function accumulatorValueBeforeLoop(instructions: Instruction[]): number {
  let accumulator = 0;
  let pointer = 0;
  const visited = new Set();
  while (true) {
    if (visited.has(pointer)) break;
    visited.add(pointer);
    const instr = instructions[pointer]
    switch (instr.op) {
      case Operator.Nop:
        pointer++;
        break;
      case Operator.Acc:
        accumulator += instr.offset;
        pointer++;
        break;
      case Operator.Jmp:
        pointer += instr.offset;
        break;
    }
  }
  return accumulator;
}

function willItLoop(instructions: Instruction[]): [boolean, State[]] {
  let state: State = { acc: 0, ptr: 0 };
  const history: State[] = [state];
  const visited = new Set();
  while (true) {
    if (visited.has(state.ptr) || state.ptr >= instructions.length) break;
    visited.add(state.ptr);
    state = operate(instructions[state.ptr], state);
    history.push(state);
  }
  return [visited.has(state.ptr), history];
}

function operate(instr: Instruction, currentState: State): State {
  const state = {...currentState};
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

function findAccumulatorAfterNonLoopingChange(instructions: Instruction[]): Accumulator {
  const swaps = {
    [Operator.Jmp]: Operator.Nop,
    [Operator.Nop]: Operator.Jmp,
  }
  let result;
  instructions.find((instr, i) => {
    if (instr.op in swaps) {
      const modifiedInstructions = [...instructions];
      modifiedInstructions[i] = {op: swaps[instr.op], offset: instr.offset};
      const [looped, history] = willItLoop(modifiedInstructions);
      if (!looped) {
        result = history[history.length - 1].acc; 
        return true
      }
    }
  })
  return result;
}

const exampleInstructions = parseInstructions(loadDayLines(8, 'example'));
example.equal(5, accumulatorValueBeforeLoop(exampleInstructions))
example.equal(8, findAccumulatorAfterNonLoopingChange(exampleInstructions))

const instructions = parseInstructions(loadDayLines(8));
console.log({
  1: accumulatorValueBeforeLoop(instructions),
  2: findAccumulatorAfterNonLoopingChange(instructions),
});
