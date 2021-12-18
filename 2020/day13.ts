import { answers, example, load } from '../advent';

type Input = {
  timestamp: number;
  buses: string[];
};

function parseInput(lines: string[]): Input {
  return {
    timestamp: Number(lines[0]),
    buses: lines[1].split(','),
  };
}

function part1(input: Input): number {
  let timestamp = input.timestamp;
  const buses = input.buses.filter((b) => b !== 'x').map(Number);
  while (true) {
    for (let i = 0; i < buses.length; ++i) {
      if (timestamp % buses[i] === 0) {
        return (timestamp - input.timestamp) * buses[i];
      }
    }
    timestamp++;
  }
}

function part2(input: Input): number {
  const buses = input.buses
    .map((x, i) => [x === 'x' ? 0 : Number(x), i])
    .filter(([period, offset]) => period > 0);
  let timestamp = 0;
  let step = 1;
  for (let [period, offset] of buses) {
    while ((timestamp + offset) % period !== 0) timestamp += step;
    step *= period;
  }
  return timestamp;
}

const exampleInput = parseInput(load(13, 'ex').lines);
example.equal(295, part1(exampleInput));
example.equal(1068781, part2(exampleInput));

const input = parseInput(load(13).lines);
answers.expect(153, 471793476184394);
answers(
  () => part1(input),
  () => part2(input)
);
