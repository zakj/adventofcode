import { answers, example, loadDay, product } from './util';

type Tile = {
  id: number;
  edges: number[];
};

function parseTiles(s: string): Tile[] {
  return s.split('\n\n').map((s) => {
    const lines = s.split('\n');
    const id = Number(lines.shift().match(/\d+/)[0]);
    const width = lines[0].length;
    const edges = [
      stringToEdge(lines[0]),
      stringToEdge(lines.map((line) => line[0]).join('')),
      stringToEdge(lines.map((line) => line[width - 1]).join('')),
      stringToEdge(lines[lines.length - 1]),
    ];
    return { id, edges };
  });
}

function stringToEdge(s: string): number {
  const fwd = s.replaceAll('#', '1').replaceAll('.', '0');
  const rev = [...fwd].reverse().join('');
  return Math.min(Number('0b' + fwd), Number('0b' + rev))
}

function edgesToTiles(tiles: Tile[]) {
  const rv = {};
  tiles.forEach(t => {
    t.edges.forEach(e => {
      rv[e] ||= [];
      rv[e].push(t.id)
    })
  })
  return rv;
}

function findCorners(tiles: Tile[]) {
  const corners = [];
  const edgeMap = edgesToTiles(tiles);
  return tiles.filter(
    (tile) => tile.edges.filter((e) => edgeMap[e].length == 1).length === 2
  );
}

const exampleTiles = parseTiles(loadDay(20, 'example'));
example.equal(20899048083289, product(findCorners(exampleTiles).map(t => t.id)))

const tiles = parseTiles(loadDay(20))
answers(
  () => product(findCorners(tiles).map(t => t.id))
)