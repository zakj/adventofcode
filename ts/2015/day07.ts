import { main } from 'lib/advent';
import { lines } from 'lib/util';

type Wires = Map<string, string[]>;

const operations: Record<string, (...args: number[]) => number> = {
  NOT: (a) => ~a,
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  LSHIFT: (a, b) => a << b,
  RSHIFT: (a, b) => a >> b,
};

const cache = new Map<string, number>();
function valueOf(wires: Wires, name: string): number {
  if (cache.has(name)) return cache.get(name);
  let value: number;
  if (!isNaN(Number(name))) {
    value = Number(name);
  } else {
    const instr = wires.get(name);
    const [a, b, c] = instr;
    switch (instr.length) {
      case 1:
        value = valueOf(wires, a);
        break;
      case 2:
        value = operations[a](valueOf(wires, b));
        break;
      case 3:
        value = operations[b](valueOf(wires, a), valueOf(wires, c));
        break;
    }
  }
  cache.set(name, value);
  return value;
}

function parse(s: string): Wires {
  return new Map(
    lines(s).map((line) => {
      const [input, output] = line.split(' -> ');
      return [output, input.split(' ')];
    })
  );
}

main(
  (s) => valueOf(parse(s), 'a'),
  (s) => {
    const wires = parse(s);
    const part1 = valueOf(wires, 'a');
    cache.clear();
    cache.set('b', part1);
    return valueOf(wires, 'a');
  }
);
