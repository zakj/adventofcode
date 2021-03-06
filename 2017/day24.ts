import { answers, example, load } from '../advent';
import { sum } from '../util';

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
  return pipes
    .sort((a, b) => {
      if (a.length === b.length) return score(a) - score(b);
      return a.length - b.length;
    })
    .pop();
}

function strongestBridge(
  pipes: Pipe[],
  start: number = 0,
  best: (pipes: Pipe[]) => Pipe
): Pipe {
  const heads = pipes.filter((p) => p.includes(start));
  const options = [];
  for (const head of heads) {
    const tails = pipes.filter((x) => x !== head);
    options.push(
      [head].concat(
        strongestBridge(
          tails,
          head[0] === head[1] ? head[0] : head.find((x) => x !== start),
          best
        )
      )
    );
  }
  return best(options) || [];
}

const examplePipes = parse(load(24, 'ex').lines);
example.equal(score(strongestBridge(examplePipes, 0, bySum)), 31);
example.equal(score(strongestBridge(examplePipes, 0, byLengthAndSum)), 19);

const pipes = parse(load(24).lines);
answers.expect(1656);
answers(
  // TODO speedup, 1.8s, 1s
  () => score(strongestBridge(pipes, 0, bySum)),
  () => score(strongestBridge(pipes, 0, byLengthAndSum))
);
