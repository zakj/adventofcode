import { main } from 'lib/advent';
import { compile, parse } from './intcode';

main(
  (s) => {
    // jump if !(A & B & C) & D
    return compile(parse(s))(
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
  (s) => {
    // jump if !(A & B & C) & D & (E | H)
    return compile(parse(s))(
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
