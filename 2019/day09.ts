import intcode from './intcode';
import { Program } from './intcode';
import { loadIntcode } from './util';

const data = loadIntcode(9);

console.log(intcode(data, [1]));
console.log(intcode(data, [2]));
