import { main } from 'lib/advent';
import { permutations, range } from 'lib/util';
import { Program, compile, parse } from './intcode';

function maxThrusterSignal(program: Program): number {
  let max = -Infinity;
  for (const perm of permutations(range(0, 5))) {
    let signal = 0;
    for (const phaseSetting of perm) {
      const amp = compile(program);
      signal = amp(phaseSetting, signal).pop();
    }
    max = Math.max(max, signal);
  }
  return max;
}

function maxThrusterFeedback(program: Program): number {
  let max = -Infinity;
  for (const phaseSettings of permutations(range(5, 10))) {
    const amps = range(0, 5).map((i) => compile(program, phaseSettings[i]));
    let signal = 0;
    while (amps.some((a) => !a.halted)) {
      for (const amp of amps) {
        signal = amp(signal).pop();
      }
    }
    max = Math.max(max, signal);
  }
  return max;
}

main(
  (s) => maxThrusterSignal(parse(s)),
  (s) => maxThrusterFeedback(parse(s))
);
