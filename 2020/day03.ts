import { example, loadDayLines, product } from './util';

enum Tile {
  Open,
  Tree,
}

type Slope = {
  right: number;
  down: number;
};

class Map {
  rows: Tile[][];

  constructor(rows: string[]) {
    const stringToTile = {
      '.': Tile.Open,
      '#': Tile.Tree,
    };
    this.rows = rows.map((row) => [...row].map((c) => stringToTile[c]));
  }

  *slope(slope: Slope) {
    let x = 0;
    let y = 0;
    while (x < this.rows.length) {
      const row = this.rows[x];
      yield row[y % row.length];
      x += slope.down;
      y += slope.right;
    }
  }

  countTilesForSlope(slope: Slope, tile: Tile): number {
    return [...this.slope(slope)].filter((tile) => tile === Tile.Tree).length;
  }
}

const exampleMap = new Map(
  `
..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#`
    .trim()
    .split('\n')
);

const part2Slopes = [
  { right: 1, down: 1 },
  { right: 3, down: 1 },
  { right: 5, down: 1 },
  { right: 7, down: 1 },
  { right: 1, down: 2 },
];

example.equal(
  7,
  exampleMap.countTilesForSlope({ right: 3, down: 1 }, Tile.Tree)
);
example.equal(
  336,
  product(part2Slopes.map((s) => exampleMap.countTilesForSlope(s, Tile.Tree)))
);

const map = new Map(loadDayLines(3));
console.log({
  1: map.countTilesForSlope({ right: 3, down: 1 }, Tile.Tree),
  2: product(part2Slopes.map((s) => map.countTilesForSlope(s, Tile.Tree))),
});
