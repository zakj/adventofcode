import Immutable from 'Immutable';
import {Observable} from 'rx';
import {inputFrom} from '..';

const INPUT = inputFrom(__dirname);

Observable.from(INPUT.match(/-?\d+/g))
  .map(v => parseInt(v, 10))
  .sum()
  .subscribe(console.log)


function sum(obj) {
  if (Immutable.Map.isMap(obj) && obj.contains('red')) {
    return 0;
  }
  if (typeof obj === 'number') {
    return obj;
  }
  if (Immutable.Map.isMap(obj) || Immutable.List.isList(obj)) {
    return obj.toSeq().reduce((acc, v) => acc + sum(v), 0);
  }
  return 0;
}
console.log(sum(Immutable.fromJS(JSON.parse(INPUT))));
