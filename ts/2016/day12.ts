import { main } from 'lib/advent';
import { execute, parse } from './asembunny';

main(
  (s) => execute(parse(s)).get('a'),
  (s) => execute(parse(s), [['c', 1]]).get('a')
);
