import { example, load, solve } from 'lib/advent';
import { sum } from 'lib/util';

type Pipe = number[];

function parse(lines: string[]): Pipe[] {
  return lines.map((line) => {
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

const examplePipes = parse(load('ex').lines);
example.equal(score(strongestBridge(examplePipes, 0, bySum)), 31);
example.equal(score(strongestBridge(examplePipes, 0, byLengthAndSum)), 19);

const pipes = parse(load().lines);
export default solve(
  () => score(strongestBridge(pipes, 0, bySum)),
  () => score(strongestBridge(pipes, 0, byLengthAndSum))
).expect(1656, 1642);
