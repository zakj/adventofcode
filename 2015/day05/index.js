import {Observable} from 'rx';
import {inputFrom} from '..';

const input = inputFrom(__dirname);
const naughtyStrings = ['ab', 'cd', 'pq', 'xy'];

Observable.from(input.trim().split('\n'))
  .filter(s => s.match(/[aeiou].*[aeiou].*[aeiou]/))
  .filter(s => s.match(/(.)\1/))
  .filter(s => {
    for (var n of naughtyStrings) {
      if (s.indexOf(n) !== -1) return false;
    }
    return true;
  })
  .count()
  .subscribe(console.log);


Observable.from(input.trim().split('\n'))
  .filter(s => s.match(/(..).*\1/))
  .filter(s => s.match(/(.).\1/))
  .count()
  .subscribe(console.log);
