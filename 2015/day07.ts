import { load, solve } from '../advent';

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

const wires = new Map(
  load().lines.map((line) => {
    const [input, output] = line.split(' -> ');
    return [output, input.split(' ')];
  })
);
export default solve(
  () => valueOf(wires, 'a'),
  (firstA) => {
    cache.clear();
    cache.set('b', firstA);
    return valueOf(wires, 'a');
  }
).expect(956, 40149);
