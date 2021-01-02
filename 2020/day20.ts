import { answers, example, load, product, range, sum } from './util';

enum Edge {
  N = 0,
  E = 1,
  S = 2,
  W = 3,
}

class Tile {
  edges: string[];
  edgeHashes: number[];

  constructor(public id: number, public image: string[][]) {
    const width = image[0].length;
    this.edges = [
      image[0].join(''),
      image.map((row) => row[width - 1]).join(''),
      image[image.length - 1].join(''),
      image.map((row) => row[0]).join(''),
    ];
    this.edgeHashes = this.edges.map(lineToNumber);
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

function lineToNumber(s: string): number {
  const fwd = s.replaceAll('#', '1').replaceAll('.', '0');
  const rev = [...fwd].reverse().join('');
  return Math.min(Number('0b' + fwd), Number('0b' + rev));
}

function edgeHashMap(tiles: Tile[]): Map<number, Tile[]> {
  const rv = new Map<number, Tile[]>();
  tiles.forEach((t) => {
    t.edgeHashes.forEach((e) => {
      rv.set(e, rv.has(e) ? [...rv.get(e), t] : [t]);
    });
  });
  return rv;
}

function findCorners(tiles: Tile[]): Tile[] {
  const corners = [];
  const edgeMap = edgeHashMap(tiles);
  return tiles.filter(
    (tile) =>
      tile.edgeHashes.filter((e) => edgeMap.get(e).length == 1).length === 2
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
  if (!start) throw new Error('wattttt');
  for (let tile of [start, flip(start)]) {
    yield tile;
    for (let i = 0; i < 3; ++i) {
      if (!tile) throw new Error('wat');
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
  const edgeMap = edgeHashMap(tiles);
  const size = Math.sqrt(tiles.length);

  let start = corners[0];
  const startEdgeHashes = start.edgeHashes.filter(
    (h) => edgeMap.get(h).length === 2
  );
  // XXX consolidate with orient? abandon edgeHashes?
  start = [...orientations(start)].find((t) => {
    return (
      startEdgeHashes.includes(t.edgeHashes[Edge.E]) &&
      startEdgeHashes.includes(t.edgeHashes[Edge.S])
    );
  });

  const image = [[start]];
  const imageRow = 0;

  const placed = new Set([start.id]);
  for (let row = 0; row < size; ++row) {
    for (let col = 0; col < size; ++col) {
      if (row === 0 && col === 0) continue;
      let prevTile: Tile;
      if (col === 0) {
        prevTile = image[row - 1][0];
        let tile = edgeMap
          .get(prevTile.edgeHashes[Edge.S])
          .filter((t) => !placed.has(t.id))[0];
        tile = orient(tile, { [Edge.N]: prevTile.edges[Edge.S] });
        image.push([tile]);
        placed.add(tile.id);
      } else {
        prevTile = image[row][col - 1];
        let tile = edgeMap
          .get(prevTile.edgeHashes[Edge.E])
          .filter((t) => !placed.has(t.id))[0];
        tile = orient(tile, { [Edge.W]: prevTile.edges[Edge.E] });
        image[row].push(tile);
        placed.add(tile.id);
      }
    }
  }

  // XXX uggh must be a better way
  const out = [];
  image.forEach((tileRow) => {
    for (let i = 1; i < tileRow[0].image.length - 1; ++i) {
      let row = [];
      tileRow.forEach((tile) => {
        row = row.concat(tile.image[i].slice(1, tile.image[i].length - 1));
      });
      out.push(row);
    }
  });
  return new Tile(0, out);
}

function markMonsters(start: Tile): Tile {
  const monster = [
    // 20x3
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

const exampleTiles = parseTiles(load(20, 'ex').paragraphs);
example.equal(
  20899048083289,
  product(findCorners(exampleTiles).map((t) => t.id))
);
example.equal(273, roughness(markMonsters(assembleImage(exampleTiles))));

const tiles = parseTiles(load(20).paragraphs);
answers(
  () => product(findCorners(tiles).map((t) => t.id)),
  () => roughness(markMonsters(assembleImage(tiles)))
);
