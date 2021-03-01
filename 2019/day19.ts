import { answers, load } from '../advent';
import { compile, parse, Program } from './intcode';

function hasBeam(program: Program, x: number, y: number): boolean {
  return compile(program)(x, y).pop() === 1;
}

const program = parse(load(19).raw);
answers.expect(118, 18651593);
answers(
  () => {
    let count = 0;
    for (let y = 0; y < 50; ++y) {
      for (let x = 0; x < 50; ++x) {
        if (hasBeam(program, x, y)) count++;
      }
    }
    return count;
  },
  () => {
    let x = 1000;
    let y = 1000;
    while (!hasBeam(program, x + 99, y)) {
      y++;
      while (!hasBeam(program, x, y + 99)) {
        x++;
      }
    }
    return x * 10e3 + y;
  }
);
