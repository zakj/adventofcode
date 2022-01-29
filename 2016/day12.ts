import { example, load, solve } from '../advent';
import { execute, parse } from './asembunny';

const exampleInstructions = parse(load('ex').lines);
example.equal(execute(exampleInstructions).get('a'), 42);

const instructions = parse(load().lines);
export default solve(
  () => execute(instructions).get('a'),
  () => execute(instructions, [['c', 1]]).get('a')
).expect(318007, 9227661);
