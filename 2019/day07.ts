import { example, load, solve } from 'lib/advent';
import { permutations, range } from 'lib/util';
import { compile, parse, Program } from './intcode';

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

const examples = load('ex').paragraphs;
for (const [program, max] of examples[0].map((l) => l.split(' '))) {
  example.equal(maxThrusterSignal(parse(program)), Number(max));
}
for (const [program, max] of examples[1].map((l) => l.split(' '))) {
  example.equal(maxThrusterFeedback(parse(program)), Number(max));
}

const program = parse(load().raw);
export default solve(
  () => maxThrusterSignal(program),
  () => maxThrusterFeedback(program)
).expect(844468, 4215746);
