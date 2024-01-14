import { main } from 'lib/advent';
import { compile, parse, Program } from './intcode';

function runWith(program: Program, noun: number, verb: number) {
  const computer = compile(program);
  computer.memory.set(1, noun);
  computer.memory.set(2, verb);
  computer();
  return computer.memory.get(0);
}

main(
  (s) => runWith(parse(s), 12, 2),
  (s) => {
    for (let noun = 0; noun < 100; ++noun)
      for (let verb = 0; verb < 100; ++verb)
        if (runWith(parse(s), noun, verb) === 19690720)
          return 100 * noun + verb;
  }
);
