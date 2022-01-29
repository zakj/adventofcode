import { load, solve } from '../advent';
import { compile, parse } from './intcode';

const program = parse(load().raw);
export default solve(
  () => compile(program)(1).pop(),
  () => compile(program)(5).pop()
).expect(7157989, 7873292);
