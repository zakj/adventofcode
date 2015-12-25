import {Observable} from 'rx';
import {inputFrom} from '..';

const values = {
  '(': 1,
  ')': -1,
};
const floorChanges$ = Observable.from(inputFrom(__dirname))
  .map(s => values[s] || 0);

floorChanges$
  .sum()
  .subscribe(console.log);


floorChanges$
  .scan((acc, cur) => acc + cur)
  .findIndex(floor => floor < 0)
  .map(index => index + 1)
  .subscribe(console.log);
