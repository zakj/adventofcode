import { main } from 'lib/advent';
import { Dir, move, parseGrid, Point, PointGrid } from 'lib/coords';

type Maze = {
  grid: PointGrid<string>;
  start: Point;
};

function parse(input: string): Maze {
  const grid = parseGrid(input.split('\n'), (c) => c);
  const start = { x: grid.xs.findIndex((x) => grid.get(x, 0) === '|'), y: 0 };
  return { grid, start };
}

const turns: Record<Dir, Dir[]> = {
  [Dir.Up]: [Dir.Left, Dir.Right],
  [Dir.Right]: [Dir.Up, Dir.Down],
  [Dir.Down]: [Dir.Left, Dir.Right],
  [Dir.Left]: [Dir.Up, Dir.Down],
};

function walk({ grid, start }: Maze): { letters: string; steps: number } {
  const letters: string[] = [];
  let cur = start;
  let dir: Dir = Dir.Down;
  const letterRe = /[a-zA-Z]/;
  let steps = 0;
  for (;;) {
    steps++;
    cur = move(cur, dir);
    const chr = grid.get(cur);
    if (chr === ' ') {
      break;
    } else if (chr.match(letterRe)) {
      letters.push(chr);
    } else if (chr === '+') {
      dir = turns[dir].find((d) => grid.get(move(cur, d)) !== ' ');
    }
  }

  return { letters: letters.join(''), steps };
}

main(
  (s) => walk(parse(s)).letters,
  (s) => walk(parse(s)).steps
);
