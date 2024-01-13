import { main } from 'lib/advent';
import { rotate } from 'lib/util';

type Spin = {
  type: 'spin';
  size: number;
};

type Exchange = {
  type: 'exchange';
  index1: number;
  index2: number;
};

type Partner = {
  type: 'partner';
  name1: string;
  name2: string;
};

type Instruction = Spin | Exchange | Partner;

function parse(s: string): Instruction[] {
  return s.split(',').map((x) => {
    const [op, ...args] = x.split('');
    if (op === 's') {
      const size = Number(args.join(''));
      return { type: 'spin', size };
    } else if (op === 'x') {
      const [index1, index2] = args.join('').split('/').map(Number);
      return { type: 'exchange', index1, index2 };
    } else if (op === 'p') {
      return { type: 'partner', name1: args[0], name2: args[2] };
    }
  });
}

function dance(programsStr: string, instructions: Instruction[]): string {
  let programs = [...programsStr];
  for (const instr of instructions) {
    if (instr.type === 'spin') {
      programs = rotate(programs, instr.size * -1);
    } else if (instr.type === 'exchange') {
      [programs[instr.index1], programs[instr.index2]] = [
        programs[instr.index2],
        programs[instr.index1],
      ];
    } else if (instr.type === 'partner') {
      const index1 = programs.findIndex((x) => x === instr.name1);
      const index2 = programs.findIndex((x) => x === instr.name2);
      [programs[index1], programs[index2]] = [
        programs[index2],
        programs[index1],
      ];
    }
  }
  return programs.join('');
}

function nthDance(
  n: number,
  programs: string,
  instructions: Instruction[]
): string {
  let cur = programs;
  const atIndex = new Map<number, string>();
  atIndex.set(0, cur);
  for (let i = 1; ; ++i) {
    cur = dance(cur, instructions);
    if (cur === programs) break;
    atIndex.set(i, cur);
  }
  return atIndex.get(n % atIndex.size);
}

main(
  (s, { programs }) => dance(programs as string, parse(s)),
  (s, { programs }) => nthDance(1e9, programs as string, parse(s))
);
