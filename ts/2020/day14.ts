import { main } from 'lib/advent';
import { lines } from 'lib/util';

type SetMask = {
  action: 'mask';
  mask: string;
};

type SetMem = {
  action: 'mem';
  address: number;
  value: number;
};

type Instruction = SetMask | SetMem;
type Program = Instruction[];

function parseProgram(lines: string[]): Program {
  return lines.map((line) => {
    const [action, value] = line.split(' = ');
    if (action === 'mask') {
      return {
        action: 'mask',
        mask: value,
      };
    }
    if (action.slice(0, 3) === 'mem') {
      return {
        action: 'mem',
        address: Number(action.match(/\d+/)?.[0]),
        value: Number(value),
      };
    }
    throw new Error();
  });
}

function sumOfMemoryValuesV1(program: Program): number {
  let mask: string;
  const mem: number[] = [];
  program.forEach((instr) => {
    if (instr.action === 'mask') {
      mask = instr.mask;
    } else {
      mem[instr.address] = applyMask(instr.value, mask);
    }
  });
  // TODO how to make util.sum work for number | bigint cleanly?
  return mem.reduce((a, b) => a + b);
}

function applyMask(value: number, mask: string): number {
  const on = BigInt(`0b${mask.replaceAll('X', '0')}`);
  const off = BigInt(`0b${mask.replaceAll('X', '1')}`);
  return Number((BigInt(value) | on) & off);
}

function sumOfMemoryValuesV2(program: Program): number {
  let mask: string;
  const mem = new Map<number, number>();
  program.forEach((instr) => {
    if (instr.action === 'mask') {
      mask = instr.mask;
    } else {
      for (const m of floatingMasks(mask)) {
        if (applyMask(instr.address, m) <= 0) throw new Error();
        mem.set(applyMask(instr.address, m), instr.value);
      }
    }
  });
  return [...mem.values()].reduce((a, b) => a + b); // TODO
}

function* floatingMasks(mask: string): Generator<string> {
  if (!mask) {
    yield '';
    return;
  }

  const [head, tail] = [mask[0], mask.slice(1)];
  for (const m of floatingMasks(tail)) {
    switch (head) {
      case '0':
        yield 'X' + m;
        break;
      case '1':
        yield '1' + m;
        break;
      case 'X':
        yield '0' + m;
        yield '1' + m;
        break;
    }
  }
}

main(
  (s) => sumOfMemoryValuesV1(parseProgram(lines(s))),
  (s) => sumOfMemoryValuesV2(parseProgram(lines(s)))
);
