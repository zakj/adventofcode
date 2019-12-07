import intcode from './intcode';
import { loadIntcode } from './util';

const data = loadIntcode(5);

console.log(intcode(data, [1]));
console.log(intcode(data, [5]));
