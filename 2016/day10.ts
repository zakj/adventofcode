import { answers, example, load } from '../advent';
import { DefaultDict, product } from '../util';

type ValueInstruction = {
  type: 'value';
  value: number;
  to: number;
};
type GiveInstruction = {
  type: 'give';
  id: number;
  low: { target: string; id: number };
  high: { target: string; id: number };
};
type Instruction = ValueInstruction | GiveInstruction;

function parse(lines: string[]): Instruction[] {
  return lines.map((line) => {
    let match: RegExpMatchArray;
    if ((match = line.match(/value (\d+) goes to bot (\d+)/))) {
      return { type: 'value', value: Number(match[1]), to: Number(match[2]) };
    } else if (
      (match = line.match(
        /bot (\d+) gives low to (bot|output) (\d+) and high to (bot|output) (\d+)/
      ))
    ) {
      return {
        type: 'give',
        id: Number(match[1]),
        low: { target: match[2], id: Number(match[3]) },
        high: { target: match[4], id: Number(match[5]) },
      };
    }
  });
}

function process(instructions: Instruction[]) {
  const bots = new DefaultDict<number, Set<number>>(() => new Set());
  const output = new DefaultDict<number, Set<number>>(() => new Set());

  instructions
    .filter((instr): instr is ValueInstruction => instr.type === 'value')
    .forEach(({ value, to }) => bots.get(to).add(value));

  const gives = new Map(
    instructions
      .filter((instr): instr is GiveInstruction => instr.type === 'give')
      .map((instr) => [instr.id, instr])
  );

  const targets = { bot: bots, output };
  const done = new Set<number>();
  while (done.size < bots.size) {
    [...bots.entries()]
      .filter(([id, chips]) => !done.has(id) && chips.size === 2)
      .forEach(([id, chips]) => {
        done.add(id);
        const instr = gives.get(id);
        const low = Math.min(...chips);
        const high = Math.max(...chips);
        targets[instr.low.target].get(instr.low.id).add(low);
        targets[instr.high.target].get(instr.high.id).add(high);
      });
  }

  return { bots, output };
}

const exampleInstructions = parse(load(10, 'ex').lines);
example.deepEqual(process(exampleInstructions).bots.get(2), new Set([2, 5]));

const instructions = parse(load(10).lines);
answers(
  () => {
    const { bots } = process(instructions);
    return [...bots.entries()].find(
      ([id, chips]) => chips.has(17) && chips.has(61)
    )[0];
  },
  () => {
    const { output } = process(instructions);
    return product([0, 1, 2].map((i) => [...output.get(i)][0]));
  }
);
