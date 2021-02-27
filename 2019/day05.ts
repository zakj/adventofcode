import { answers, load } from '../advent';
import { compile, parse } from './intcode';

const program = parse(load(5).raw);
answers.expect(7157989, 7873292);
answers(
  () => compile(program)(1).pop(),
  () => compile(program)(5).pop()
);
