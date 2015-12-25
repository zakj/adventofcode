import {Observable} from 'rx';
import {inputFrom} from '..';

const input = inputFrom(__dirname);
const word$ = Observable.from(input.trim().split('\n'))

word$
  .map(word => {
    const quotes = (word.match(/\\["\\]/g) || []).length;
    const hexChars = (word.match(/\\x[0-9a-fA-F]{2}/g) || []).length;
    return 2 + quotes + hexChars*3;
  })
  .sum()
  .subscribe(console.log)


word$
  // + 2 for the new surrounding quotes.
  .map(word => word.replace(/([\\"])/g, '\\$1').length - word.length + 2)
  .sum()
  .subscribe(console.log)
