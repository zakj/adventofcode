import Immutable from 'immutable';
import memoize from 'memoizee';
import {Observable} from 'rx';

import {inputFrom} from '..';

const input = inputFrom(__dirname);

const OPS = {
  NOT: a => ~a,
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  LSHIFT: (a, b) => a << b,
  RSHIFT: (a, b) => a >> b,
};

const valueOf = memoize((wires, name) => {
  if (typeof name === 'number') return name;
  const instr = wires.get(name);
  if (!instr) console.log(wires, name);
  switch (instr.length) {
  case 1: return valueOf(wires, instr[0]); break;
  case 2: return OPS[instr[0]](valueOf(wires, instr[1])); break;
  case 3: return OPS[instr[1]](valueOf(wires, instr[0]), valueOf(wires, instr[2])); break;
  }
});

const reducer = (wires, instr) => {
  const [inputString, output] = instr.split(' -> ');
  const input = inputString.split(' ').map(s => {
    const num = parseInt(s, 10);
    return (isNaN(num) || !isFinite(num)) ? s : num;
  });
  return wires.set(output, input);
};

let firstA;
Observable.from(input.trim().split('\n'))
  .reduce(reducer, new Immutable.Map)
  .map(wires => valueOf(wires, 'a'))
  .subscribe(v => firstA = v);
console.log(firstA);


valueOf.clear();
Observable.from(input.trim().split('\n').concat(`${firstA} -> b`))
  .reduce(reducer, new Immutable.Map)
  .map(wires => valueOf(wires, 'a'))
  .subscribe(console.log)
