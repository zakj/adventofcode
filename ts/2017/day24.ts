import { main } from 'lib/advent';
import { lines, sum } from 'lib/util';

type Pipe = number[];

function parse(s: string): Pipe[] {
  return lines(s).map((line) => {
    return line.split('/').map(Number);
  });
}

const score = (pipe: Pipe): number => sum(pipe.flat());

function bySum(pipes: Pipe[]): Pipe {
  return pipes.sort((a, b) => score(a) - score(b)).pop();
}

function byLengthAndSum(pipes: Pipe[]): Pipe {
  return pipes.sort((a, b) => a.length - b.length || score(a) - score(b)).pop();
}

function strongestBridge(
  pipes: Pipe[],
  start: number,
  best: (pipes: Pipe[]) => Pipe
): Pipe {
  const heads = pipes.filter((p) => p.includes(start));
  const options = [];
  for (const head of heads) {
    const tails = pipes.filter((x) => x !== head);
    options.push(
      [head].concat(
        strongestBridge(tails, head[0] === start ? head[1] : head[0], best)
      )
    );
  }
  return best(options) || [];
}

main(
  (s) => score(strongestBridge(parse(s), 0, bySum)),
  (s) => score(strongestBridge(parse(s), 0, byLengthAndSum))
);
