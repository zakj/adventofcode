import { main } from 'lib/advent';
import { lines, product } from 'lib/util';

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
    return [...this.slope(slope)].filter((t) => t === tile).length;
  }
}

const part2Slopes = [
  { right: 1, down: 1 },
  { right: 3, down: 1 },
  { right: 5, down: 1 },
  { right: 7, down: 1 },
  { right: 1, down: 2 },
];

main(
  (s) => new Map(lines(s)).countTilesForSlope({ right: 3, down: 1 }, Tile.Tree),
  (s) => {
    const map = new Map(lines(s));
    return product(
      part2Slopes.map((s) => map.countTilesForSlope(s, Tile.Tree))
    );
  }
);
