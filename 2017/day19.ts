import { answers, example, load } from '../advent';

enum Dir {
  D = 'D',
  U = 'U',
  R = 'R',
  L = 'L',
}
type Point = { x: number; y: number };
type Maze = string[][];

function parse(input: string): Maze {
  return input.split('\n').map((line) => line.split(''));
}

const directions = new Map<Dir, (p: Point) => Point>([
  [Dir.D, (p) => ({ ...p, y: p.y + 1 })],
  [Dir.U, (p) => ({ ...p, y: p.y - 1 })],
  [Dir.R, (p) => ({ ...p, x: p.x + 1 })],
  [Dir.L, (p) => ({ ...p, x: p.x - 1 })],
]);
function walk(maze: string[][]): { letters: string; steps: number } {
  const letters: string[] = [];
  let cur = { x: maze[0].findIndex((x) => x === '|'), y: 0 };
  let dir = Dir.D;
  const letterRe = /[a-zA-Z]/;
  const mazeAt = (p: Point): string => maze[p.y][p.x];
  const isWalkable = (p: Point): boolean => maze[p.y][p.x] !== ' ';
  let steps = 0;
  while (true) {
    steps++;
    cur = directions.get(dir)(cur);
    const chr = mazeAt(cur);
    if (chr === ' ') {
      break;
    } else if (chr.match(letterRe)) {
      letters.push(chr);
    } else if (chr === '+') {
      if ([Dir.D, Dir.U].includes(dir)) {
        dir = [Dir.L, Dir.R].find((d) => isWalkable(directions.get(d)(cur)));
      } else if ([Dir.L, Dir.R].includes(dir)) {
        dir = [Dir.U, Dir.D].find((d) => isWalkable(directions.get(d)(cur)));
      }
    }
  }

  return { letters: letters.join(''), steps };
}

const exampleMaze = parse(load(19, 'ex').raw);
example.equal(walk(exampleMaze).letters, 'ABCDEF');
example.equal(walk(exampleMaze).steps, 38);

const maze = parse(load(19).raw);
answers.expect('DWNBGECOMY');
answers(
  () => walk(maze).letters,
  () => walk(maze).steps
);
