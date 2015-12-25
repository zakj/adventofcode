import {Observable} from 'rx';
import {inputFrom} from '..';

const input = inputFrom(__dirname);

const ON = Symbol('ON');
const OFF = Symbol('OFF');
const TOGGLE = Symbol('TOGGLE');

const instruction$ = Observable.from(input.trim().split('\n'))
  .take(10)
  .concatMap(line => {
    const words = line.split(/\s+/)
    let action;
    switch (words.shift()) {
    case 'turn': action = words.shift() === 'on' ? ON : OFF; break;
    case 'toggle': action = TOGGLE; break;
    }
    const from = words[0].split(',').map(v => parseInt(v, 10));
    const to = words[2].split(',').map(v => parseInt(v, 10));
    const x$ = Observable.range(from[0], to[0] + 1 - from[0]);
    const y$ = Observable.range(from[1], to[1] + 1 - from[1]);
    return Observable.repeat(action)
      .zip(x$.concatMap(x => Observable.repeat(x).zip(y$)));
  })

const actions = {
  [ON]: _ => 1,
  [OFF]: _ => 0,
  [TOGGLE]: v => v ? 0 : 1,
}
let lights = new Array(1000)
for (let i = 0; i < lights.length; ++i) {
  lights[i] = new Array(1000);
}
instruction$
  .tap(([action, [x, y]]) => lights[x][y] = actions[action](lights[x][y]))
  .subscribe();
on = 0;
for (let i = 0; i < lights.length; ++i) {
  for (let j = 0; j < 1000; ++j) {
    on += lights[i][j] === 1 ? 1 : 0;
  }
}
console.log(on)



lights = new Array(1000)
for (let i = 0; i < lights.length; ++i) {
  lights[i] = [];
  for (let j = 0; j < 1000; ++j) {
    lights[i][j] = 0;
  }
}
instruction$
  .take(10)
  .tap(([action, [x, y]]) => {
    switch (action) {
    case ON: lights[x][y] += 1; break;
    case OFF: lights[x][y] = Math.max(0, lights[x][y] - 1); break;
    case TOGGLE: lights[x][y] += 2; break;
    }
  })
  .subscribe();
let on = 0;
for (let i = 0; i < lights.length; ++i) {
  for (let j = 0; j < 1000; ++j) {
    on += lights[i][j];
  }
}
console.log(on)
