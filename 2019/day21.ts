import { load, solve } from 'lib/advent';
import { compile, parse } from './intcode';

const program = parse(load().raw);
export default solve(
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
).expect(19362822, 1143625214);
