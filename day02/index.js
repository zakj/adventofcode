import {Observable} from 'rx';
import {inputFrom} from '..';

const input = inputFrom(__dirname);
const dimensions$ = Observable.from(input.trim().split('\n'))
  .map(s => s.split('x').map(x => parseInt(x, 10)));

dimensions$
  .map(([l, w, h]) => 2*l*w + 2*w*h + 2*h*l + Math.min(l*w, w*h, h*l))
  .sum()
  .subscribe(console.log);


const wrapRibbon$ = dimensions$
  .map(d => d.sort((a, b) => a - b).slice(0, 2))
  .map(([s1, s2]) => 2*s1 + 2*s2);
const bowRibbon$ = dimensions$
  .map(([l, w, h]) => l * w * h);
Observable.zip(wrapRibbon$, bowRibbon$, (w, b) => w + b)
  .sum()
  .subscribe(console.log)
