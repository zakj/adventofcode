import { answers, load } from '../advent';
import { compile, parse } from './intcode';

const program = parse(load(9).raw);
answers.expect(3546494377, 47253);
answers(
  () => compile(program)(1).pop(),
  () => compile(program)(2).pop()
);
