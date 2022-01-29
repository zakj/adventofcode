import { example, load, solve } from '../advent';

type Instruction = {
  write: boolean;
  move: 1 | -1;
  next: string;
};
type StateInstructions = [Instruction, Instruction];
type States = Map<string, StateInstructions>;
type Tape = Map<number, boolean>;

function parse(paras: string[][]): [string, number, States] {
  const start = paras[0][0].match(/state (\w)\.$/)[1];
  const steps = Number(paras[0][1].match(/after (\d+) steps/)[1]);
  const states: States = new Map();
  for (const para of paras.slice(1)) {
    const name = para[0].match(/state (\w):$/)[1];
    states.set(name, [
      {
        write: para[2].match(/value (1|0)/)[1] === '1',
        move: para[3].match(/to the (right|left)/)[1] === 'right' ? 1 : -1,
        next: para[4].match(/state (\w)\.$/)[1],
      },
      {
        write: para[6].match(/value (1|0)/)[1] === '1',
        move: para[7].match(/to the (right|left)/)[1] === 'right' ? 1 : -1,
        next: para[8].match(/state (\w)\.$/)[1],
      },
    ]);
  }
  return [start, steps, states];
}

function checksum(start: string, steps: number, states: States): number {
  const tape: Tape = new Map();
  let cur = 0;
  let state = states.get(start);
  for (let i = 0; i < steps; ++i) {
    const instr = state[tape.get(cur) ? 1 : 0];
    tape.set(cur, instr.write);
    cur += instr.move;
    state = states.get(instr.next);
  }
  return [...tape.values()].filter(Boolean).length;
}

const [exStart, exSteps, exStates] = parse(load('ex').paragraphs);
example.equal(checksum(exStart, exSteps, exStates), 3);

const [start, steps, states] = parse(load().paragraphs);
export default solve(() => checksum(start, steps, states)).expect(3362);
