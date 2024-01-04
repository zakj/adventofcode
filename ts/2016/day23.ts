import { main } from 'lib/advent';
import { execute, parse } from './asembunny';

main(
  (s) => execute(parse(s), [['a', 7]]).get('a'),
  (s) => execute(parse(s), [['a', 12]]).get('a')
);
