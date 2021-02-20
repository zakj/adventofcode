import { answers, load } from '../advent';
import { compile, parse, Program } from './intcode';

function runWith(program: Program, noun: number, verb: number) {
  const c = compile(program);
  c.memory[1] = noun;
  c.memory[2] = verb;
  [...c()];
  return c.memory[0];
}

const program = parse(load(2).raw);
answers.expect(3706713, 8609);
answers(
  () => runWith(program, 12, 2),
  () => {
    for (let noun = 0; noun < 100; ++noun)
      for (let verb = 0; verb < 100; ++verb)
        if (runWith(program, noun, verb) === 19690720) return 100 * noun + verb;
  }
);
