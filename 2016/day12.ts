import { answers, example, load } from './advent';
import { execute, parse } from './asembunny';

const exampleInstructions = parse(load(12, 'ex').lines);
example.equal(execute(exampleInstructions).get('a'), 42);

const instructions = parse(load(12).lines);
answers(
  () => execute(instructions).get('a'),
  () => execute(instructions, [['c', 1]]).get('a')
);
