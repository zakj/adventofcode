import { answers, example, load } from '../advent';
import { execute, parse } from './asembunny';

const exampleInstructions = parse(load(23, 'ex').lines);
example.equal(execute(exampleInstructions).get('a'), 3);

const instructions = parse(load(23).lines);
answers(
  () => execute(instructions, [['a', 7]]).get('a'),
  () => execute(instructions, [['a', 12]]).get('a')
);
