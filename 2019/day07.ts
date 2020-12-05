import intcode from './intcode';
import { Program } from './intcode';
import { loadIntcode, permutations } from './util';

const data = loadIntcode(7);

function amplifier(program: Program, phaseSettings: number[]) {
  let signal = 0;
  phaseSettings.forEach(phaseSetting => {
    const gen = intcode(program, [phaseSetting, signal])
    signal = gen.next().value as number;
  })
  return signal;
}

function findHighestOutput(program: Program) {
  let max = -Infinity;
  for (let phaseSettings of permutations([0, 1, 2, 3, 4])) {
    const signal = amplifier(program, phaseSettings);
    max = Math.max(max, signal);
  }
  return max;
}

function findHighestOutputWithFeedback(program: Program) {
  let max = -Infinity;
  for (let phaseSettings of permutations([5, 6, 7, 8, 9])) {
    const signal = amplifier(program, phaseSettings);
    max = Math.max(max, signal);
  }
  return max;
}

console.log(findHighestOutput(data));


function applyFunction(f: (x: number) => number, x: number): number {
  return f(x);
}
