import { load, solve } from '../advent';
import { sum } from '../util';

function ignoreRed(obj: number | any[] | Object) {
  let values: any[];
  if (typeof obj === 'string') {
    return 0;
  } else if (typeof obj === 'number') {
    return obj;
  } else if (Array.isArray(obj)) {
    values = obj;
  } else {
    values = Object.values(obj);
    if (values.includes('red')) return 0;
  }
  return values.reduce((acc, v) => acc + ignoreRed(v), 0);
}

const input = load().raw;
export default solve(
  () => sum(input.match(/-?\d+/g).map(Number)),
  () => ignoreRed(JSON.parse(input))
).expect(119433, 68466);
