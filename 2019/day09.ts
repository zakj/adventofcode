import { load, solve } from '../advent';
import { compile, parse } from './intcode';

const program = parse(load().raw);
export default solve(
  () => compile(program)(1).pop(),
  () => compile(program)(2).pop()
).expect(3546494377, 47253);
