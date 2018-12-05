import {Observable} from 'rx';
import {inputFrom} from '..';

const input = inputFrom(__dirname);

const deltas = {
  '^': [0, 1],
  '>': [1, 0],
  'v': [0, -1],
  '<': [-1, 0],
}
const move$ = Observable.from(input.trim())
  .filter(d => d in deltas)
  .map(d => deltas[d]);

move$
  .scan((location, delta) => [location[0] + delta[0], location[1] + delta[1]])
  .startWith([0, 0])
  .distinct()
  .count()
  .subscribe(console.log)


const santaVisit$ = move$
  .filter((_, i) => i % 2 === 0)
  .scan((location, delta) => [location[0] + delta[0], location[1] + delta[1]])
  .startWith([0, 0]);

const robotVisit$ = move$
  .filter((_, i) => i % 2 !== 0)
  .scan((location, delta) => [location[0] + delta[0], location[1] + delta[1]])
  .startWith([0, 0]);
  
Observable.merge(santaVisit$, robotVisit$)
  .distinct()
  .count()
  .subscribe(console.log);
