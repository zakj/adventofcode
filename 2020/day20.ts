import { example, load, solve } from 'lib/advent';
import { product, range, sum } from 'lib/util';

enum Edge {
  N = 0,
  E = 1,
  S = 2,
  W = 3,
}

class Tile {
  constructor(public id: number, public image: string[][]) {}

  get edges() {
    const width = this.image[0].length;
    return [
      this.image[0].join(''),
      this.image.map((row) => row[width - 1]).join(''),
      this.image[this.image.length - 1].join(''),
      this.image.map((row) => row[0]).join(''),
    ];
  }

  get interior() {
    return this.image
      .slice(1, this.image.length - 1)
      .map((s) => s.slice(1, s.length - 1));
  }

  toString() {
    return this.image.map((row) => row.join('')).join('\n');
  }
}

function parseTiles(tiles: string[][]): Tile[] {
  return tiles.map((lines) => {
    const id = Number(lines.shift().match(/\d+/)[0]);
    return new Tile(
      id,
      lines.map((line) => line.split(''))
    );
  });
}

function makeEdgeMap(tiles: Tile[]): Map<string, Tile[]> {
  const rv = new Map<string, Tile[]>();
  tiles.forEach((t) => {
    t.edges.forEach((e) => {
      rv.set(e, rv.has(e) ? [...rv.get(e), t] : [t]);
      const reversed = [...e].reverse().join('');
      rv.set(reversed, rv.has(reversed) ? [...rv.get(reversed), t] : [t]);
    });
  });
  return rv;
}

function findCorners(tiles: Tile[]): Tile[] {
  const edgeMap = makeEdgeMap(tiles);
  return tiles.filter(
    (t) => t.edges.filter((e) => edgeMap.get(e).length == 1).length === 2
  );
}

function zip(...arrs: any[][]): any[][] {
  return range(0, arrs[0].length).map((i) => arrs.map((x) => x[i]));
}

function rotate(tile: Tile): Tile {
  return new Tile(
    tile.id,
    zip(...tile.image).map((row) => row.reverse())
  );
}

function flip(tile: Tile): Tile {
  return new Tile(tile.id, [...tile.image].reverse());
}

function* orientations(start: Tile): Generator<Tile> {
  for (let tile of [start, flip(start)]) {
    yield tile;
    for (let i = 0; i < 3; ++i) {
      tile = rotate(tile);
      yield tile;
    }
  }
}

function orient(tile: Tile, edges: Partial<Record<Edge, string>>): Tile {
  return [...orientations(tile)].find((t) => {
    return Object.entries(edges).every(([dir, edge]) => t.edges[dir] === edge);
  });
}

function assembleImage(tiles: Tile[]): Tile {
  const corners = findCorners(tiles);
  const edgeMap = makeEdgeMap(tiles);

  const startEdges = corners[0].edges
    .filter((e) => edgeMap.get(e).length === 2)
    .map((e) => [e, [...e].reverse().join('')])
    .flat();
  const start = [...orientations(corners[0])].find((t) => {
    return (
      startEdges.includes(t.edges[Edge.E]) &&
      startEdges.includes(t.edges[Edge.S])
    );
  });

  const image = [[start]];
  const imageRow = 0;
  const size = Math.sqrt(tiles.length);
  const placed = new Set([start.id]);
  for (let row = 0; row < size; ++row) {
    for (let col = 0; col < size; ++col) {
      let prevTile: Tile, prevDir: Edge, prevEdge: string;
      if (col === 0) {
        if (row === 0) continue; // start
        prevTile = image[row - 1][0];
        prevDir = Edge.N;
        prevEdge = prevTile.edges[Edge.S];
        image[row] = [];
      } else {
        prevTile = image[row][col - 1];
        prevDir = Edge.W;
        prevEdge = prevTile.edges[Edge.E];
      }
      let tile = edgeMap.get(prevEdge).find((t) => !placed.has(t.id));
      tile = orient(tile, { [prevDir]: prevEdge });
      image[row].push(tile);
      placed.add(tile.id);
    }
  }

  const fullImage = image
    .map((row) =>
      range(0, row[0].interior.length).map((i) =>
        [].concat(row.map((t) => t.interior[i])).flat()
      )
    )
    .flat();
  return new Tile(0, fullImage);
}

function markMonsters(start: Tile): Tile {
  const monster = [
    '..................#.',
    '#....##....##....###',
    '.#..#..#..#..#..#...',
  ];
  const monsterWidth = monster[0].length;
  const monsterRe = monster.map((s) => new RegExp(s));
  const monsterIndexes = monster.map((s) =>
    s
      .split('')
      .map((c, i) => (c === '#' ? i : -1))
      .filter((i) => i !== -1)
  );
  const sliceMatches = (s: string[], i: number, n: number) =>
    s
      .slice(i, i + monsterWidth)
      .join('')
      .match(monsterRe[n]);

  return [...orientations(start)].find((tile) => {
    let found = false;
    tile.image.slice(1, tile.image.length - 1).forEach((line, imageIndex) => {
      for (let i = 0; i < line.length - monsterWidth; ++i) {
        if (
          sliceMatches(line, i, 1) &&
          sliceMatches(tile.image[imageIndex + 2], i, 2) &&
          sliceMatches(tile.image[imageIndex], i, 0)
        ) {
          found = true;
          monsterIndexes.forEach((indexes, offset) => {
            indexes.forEach((index) => {
              tile.image[imageIndex + offset][i + index] = 'O';
            });
          });
        }
      }
    });
    return found;
  });
}

function roughness(tile: Tile): number {
  return sum(tile.image.flat().map((c) => (c === '#' ? 1 : 0)));
}

const exampleTiles = parseTiles(load('ex').paragraphs);
example.equal(
  20899048083289,
  product(findCorners(exampleTiles).map((t) => t.id))
);
example.equal(273, roughness(markMonsters(assembleImage(exampleTiles))));

const tiles = parseTiles(load().paragraphs);
export default solve(
  () => product(findCorners(tiles).map((t) => t.id)),
  () => roughness(markMonsters(assembleImage(tiles)))
).expect(5775714912743, 1836);
