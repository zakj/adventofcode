import { answers, load } from '../advent';
import { compile, parse } from './intcode';

const program = parse(load(21).raw);
answers.expect(19362822, 1143625214);
answers(
  () => {
    // jump if !(A & B & C) & D
    return compile(program)(
      'NOT A T',
      'OR T J',
      'NOT B T',
      'OR T J',
      'NOT C T',
      'OR T J',
      'AND D J',
      'WALK'
    ).pop();
  },
  () => {
    // jump if !(A & B & C) & D & (E | H)
    return compile(program)(
      'NOT A T',
      'OR T J',
      'NOT B T',
      'OR T J',
      'NOT C T',
      'OR T J',
      'AND D J',
      'NOT J T',
      'OR E T',
      'OR H T',
      'AND T J',
      'RUN'
    ).pop();
  }
);
