import { main } from 'lib/advent';
import { compile, parse } from './intcode';

main(
  (s) => compile(parse(s))(1).pop(),
  (s) => compile(parse(s))(2).pop()
);
