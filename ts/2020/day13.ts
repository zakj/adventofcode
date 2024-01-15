import { main } from 'lib/advent';
import { lines } from 'lib/util';

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
  for (;;) {
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
    .filter(([period]) => period > 0);
  let timestamp = 0;
  let step = 1;
  for (const [period, offset] of buses) {
    while ((timestamp + offset) % period !== 0) timestamp += step;
    step *= period;
  }
  return timestamp;
}

main(
  (s) => part1(parseInput(lines(s))),
  (s) => part2(parseInput(lines(s)))
);
