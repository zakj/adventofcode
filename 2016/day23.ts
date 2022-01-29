import { example, load, solve } from '../advent';
import { execute, parse } from './asembunny';

const exampleInstructions = parse(load('ex').lines);
example.equal(execute(exampleInstructions).get('a'), 3);

const instructions = parse(load().lines);
export default solve(
  () => execute(instructions, [['a', 7]]).get('a'),
  () => execute(instructions, [['a', 12]]).get('a')
).expect(11004, 479007564);
