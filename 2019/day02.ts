import { load, solve } from 'lib/advent';
import { compile, parse, Program } from './intcode';

function runWith(program: Program, noun: number, verb: number) {
  const computer = compile(program);
  computer.memory.set(1, noun);
  computer.memory.set(2, verb);
  computer();
  return computer.memory.get(0);
}

const program = parse(load().raw);
export default solve(
  () => runWith(program, 12, 2),
  () => {
    for (let noun = 0; noun < 100; ++noun)
      for (let verb = 0; verb < 100; ++verb)
        if (runWith(program, noun, verb) === 19690720) return 100 * noun + verb;
  }
).expect(3706713, 8609);
