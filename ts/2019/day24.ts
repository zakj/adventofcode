import { main } from 'lib/advent';
import { lines, range, sum, XSet } from 'lib/util';

type Layer = boolean[];
const LAYER_SIZE = 5;

function parse(lines: string[]): Layer {
  return lines
    .join('')
    .split('')
    .map((c) => c === '#');
}

const xyToI = ([x, y]: [number, number]): number => y * LAYER_SIZE + x;
const iToXy = (i: number): [x: number, y: number] => [
  i % LAYER_SIZE,
  Math.floor(i / LAYER_SIZE),
];

function neighborCount(layer: Layer, i: number): number {
  const [x, y] = iToXy(i);
  return [
    [x, y - 1],
    [x, y + 1],
    [x - 1, y],
    [x + 1, y],
  ]
    .filter(([x, y]) => x >= 0 && x < LAYER_SIZE && y >= 0 && y < LAYER_SIZE)
    .map(xyToI)
    .filter((i) => layer[i]).length;
}

function toString(layout: Layer): string {
  const rows = [];
  for (let y = 0; y < LAYER_SIZE; ++y) {
    const row = [];
    for (let x = 0; x < LAYER_SIZE; ++x) {
      row.push(layout[xyToI([x, y])] ? '#' : '.');
    }
    rows.push(row.join(''));
  }
  return rows.join('\n');
}

function firstRepeating(layer: Layer): Layer {
  layer = layer.slice();
  const seen = new XSet<boolean[]>((tiles: boolean[]) =>
    tiles.map((t) => (t ? '#' : '.')).join('')
  );
  seen.add(layer);
  for (;;) {
    const next: boolean[] = [];
    layer.forEach((t, i) => {
      const neighbors = neighborCount(layer, i);
      next.push(t ? neighbors === 1 : neighbors === 1 || neighbors === 2);
    });
    layer = next;
    if (seen.has(layer)) break;
    seen.add(layer);
  }
  return layer;
}

function biodiversity(layout: Layer): number {
  return sum(layout.map((t, i) => (t ? Math.pow(2, i) : 0)));
}

type Depth = number;
type InfiniteGrid = {
  layers: Map<Depth, Layer>;
  max: Depth;
  min: Depth;
};

function bugsInColumn(grid: InfiniteGrid, depth: Depth, x: number): number {
  const layer = grid.layers.get(depth);
  return range(0, 5)
    .map((y) => xyToI([x, y]))
    .filter((i) => layer[i]).length;
}

function bugsInRow(grid: InfiniteGrid, depth: Depth, y: number): number {
  const layer = grid.layers.get(depth);
  return range(0, 5)
    .map((x) => xyToI([x, y]))
    .filter((i) => layer[i]).length;
}

const isCenter = (x: number, y: number): boolean =>
  x === y && x === Math.floor(LAYER_SIZE / 2);

function infNeighborCount(grid: InfiniteGrid, depth: Depth, i: number): number {
  const [ox, oy] = iToXy(i);
  const center = Math.floor(LAYER_SIZE / 2);
  const candidates = [
    [ox, oy - 1],
    [ox, oy + 1],
    [ox - 1, oy],
    [ox + 1, oy],
  ];
  return sum(
    candidates.map(([x, y]) => {
      let bugs = 0;

      const outerLayer = grid.layers.get(depth - 1);
      if (outerLayer) {
        if (x < 0 && outerLayer[xyToI([center - 1, center])]) bugs++;
        if (x >= LAYER_SIZE && outerLayer[xyToI([center + 1, center])]) bugs++;
        if (y < 0 && outerLayer[xyToI([center, center - 1])]) bugs++;
        if (y >= LAYER_SIZE && outerLayer[xyToI([center, center + 1])]) bugs++;
      }

      if (isCenter(x, y) && grid.layers.has(depth + 1)) {
        if (x < ox) bugs += bugsInColumn(grid, depth + 1, LAYER_SIZE - 1);
        if (x > ox) bugs += bugsInColumn(grid, depth + 1, 0);
        if (y < oy) bugs += bugsInRow(grid, depth + 1, LAYER_SIZE - 1);
        if (y > oy) bugs += bugsInRow(grid, depth + 1, 0);
      }

      if (
        x >= 0 &&
        x < LAYER_SIZE &&
        y >= 0 &&
        y < LAYER_SIZE &&
        grid.layers.get(depth)[xyToI([x, y])]
      )
        bugs++;

      return bugs;
    })
  );
}

function infiniteGrid(initialLayer: Layer, minutes: number): InfiniteGrid {
  let grid: InfiniteGrid = {
    layers: new Map([[0, initialLayer.slice()]]),
    max: 0,
    min: 0,
  };
  for (; minutes > 0; --minutes) {
    const next: InfiniteGrid = {
      layers: new Map(),
      min: Infinity,
      max: -Infinity,
    };
    for (let depth = grid.min - 1; depth <= grid.max + 1; ++depth) {
      if (!grid.layers.has(depth)) {
        grid.layers.set(depth, new Array(LAYER_SIZE * LAYER_SIZE).fill(false));
      }
      const layer: Layer = grid.layers.get(depth);
      const nextLayer: boolean[] = [];
      layer.forEach((t, i) => {
        let bug = false;
        if (!isCenter(...iToXy(i))) {
          const neighbors = infNeighborCount(grid, depth, i);
          bug = t ? neighbors === 1 : neighbors === 1 || neighbors === 2;
        }
        nextLayer.push(bug);
      });
      next.layers.set(depth, nextLayer);
      if (nextLayer.filter(Boolean).length > 0) {
        next.min = Math.min(depth, next.min);
        next.max = Math.max(depth, next.max);
      }
    }
    grid = next;
  }
  return grid;
}

function totalBugs(grid: InfiniteGrid): number {
  return [...grid.layers.values()].flat().filter(Boolean).length;
}

main(
  (s) => biodiversity(firstRepeating(parse(lines(s)))),
  (s, { minutes }) =>
    totalBugs(infiniteGrid(parse(lines(s)), minutes as number))
);
