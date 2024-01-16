import { main } from 'lib/advent';
import { chunks, last, lines, ValuesOf } from 'lib/util';

const Type = {
  Push: 0,
  Pop: 1,
} as const;
type Type = ValuesOf<typeof Type>;

type Program = { type: Type; value: number }[];

function parse(lines: string[]): Program {
  return chunks(lines, lines.length / 14).map((chunk) => {
    const bValue = (line: string): number => Number(line.split(' ')[2]);
    const zDiv = bValue(chunk[4]);
    const pushVal = bValue(chunk[15]);
    const testVal = bValue(chunk[5]);
    // if z /= 1, we can't pass the check, so we push to z.
    // otherwise (z /= 26, which pops), we can pass the check and skip the push
    return zDiv === 1
      ? { type: Type.Push, value: pushVal }
      : { type: Type.Pop, value: testVal };
  });
}

function findPossibleInputs(program: Program): Record<number, number[]>[] {
  const pairIndexes: [number, number][] = [];
  const stack = [];
  for (let i = 0; i < program.length; ++i) {
    if (program[i].type === Type.Push) stack.push(i);
    else pairIndexes.push([stack.pop(), i]);
  }

  const possibleInputs = [];
  for (const [a, b] of pairIndexes) {
    const values = { [a]: [], [b]: [] };
    for (let i = 1; i <= 9; ++i) {
      for (let j = 1; j <= 9; ++j) {
        if (program[a].value + i + program[b].value !== j) continue;
        values[a].push(i);
        values[b].push(j);
      }
    }
    possibleInputs.push(values);
  }

  return possibleInputs;
}

main(
  (s) => {
    const possibleInputs = findPossibleInputs(parse(lines(s)));
    const input = new Array(14);
    for (const pair of possibleInputs) {
      for (const [index, values] of Object.entries(pair)) {
        input[index] = last(values);
      }
    }
    return Number(input.join(''));
  },
  (s) => {
    const possibleInputs = findPossibleInputs(parse(lines(s)));
    const input = new Array(14);
    for (const pair of possibleInputs) {
      for (const [index, values] of Object.entries(pair)) {
        input[index] = values[0];
      }
    }
    return Number(input.join(''));
  }
);
