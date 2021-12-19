import { answers, example, load } from '../advent';
import { Dir, move, Point, pointToString } from '../coords';
import { Counter } from '../util';

type Map = {
  tracks: string[][];
  carts: Cart[];
  crashes: string[];
};
type Cart = {
  dir: Dir;
  loc: Point;
  turns: number;
};

const inputDirs = new Map<string, Dir>([
  ['^', Dir.Up],
  ['>', Dir.Right],
  ['v', Dir.Down],
  ['<', Dir.Left],
]);

function parse(input: string): Map {
  const tracks = input.split('\n').map((line) => line.split(''));
  const carts: Cart[] = tracks.flatMap((row, y) => {
    const carts = [];
    for (let x = 0; x < row.length; ++x) {
      if (inputDirs.has(row[x]))
        carts.push({ loc: { x, y }, turns: 0, dir: inputDirs.get(row[x]) });
    }
    return carts;
  });
  for (const cart of carts) {
    tracks[cart.loc.y][cart.loc.x] = [Dir.Up, Dir.Down].includes(cart.dir)
      ? '|'
      : '-';
  }
  return { tracks, carts, crashes: [] };
}

function toString(map: Map): string {
  const tracks = map.tracks.map((row) => [...row]);
  const dirStrings = new Map([...inputDirs.entries()].map(([k, v]) => [v, k]));
  for (const cart of map.carts) {
    tracks[cart.loc.y][cart.loc.x] = dirStrings.get(cart.dir);
  }
  return tracks.map((l) => l.join('')).join('\n');
}

const cartBends: Record<string, Record<Dir, Dir>> = {
  '/': {
    [Dir.Left]: Dir.Down,
    [Dir.Right]: Dir.Up,
    [Dir.Up]: Dir.Right,
    [Dir.Down]: Dir.Left,
  },
  '\\': {
    [Dir.Left]: Dir.Up,
    [Dir.Right]: Dir.Down,
    [Dir.Up]: Dir.Left,
    [Dir.Down]: Dir.Right,
  },
};
const cartIntersections: Record<Dir, Dir>[] = [
  // left
  {
    [Dir.Left]: Dir.Down,
    [Dir.Right]: Dir.Up,
    [Dir.Up]: Dir.Left,
    [Dir.Down]: Dir.Right,
  },
  // straight
  {
    [Dir.Left]: Dir.Left,
    [Dir.Right]: Dir.Right,
    [Dir.Up]: Dir.Up,
    [Dir.Down]: Dir.Down,
  },
  // right
  {
    [Dir.Left]: Dir.Up,
    [Dir.Right]: Dir.Down,
    [Dir.Up]: Dir.Right,
    [Dir.Down]: Dir.Left,
  },
];

function tick(map: Map): Map {
  map.carts.sort((a, b) => {
    if (a.loc.y === b.loc.y) return a.loc.x - b.loc.x;
    return a.loc.y - b.loc.y;
  });
  for (const cart of map.carts) {
    cart.loc = move(cart.loc, cart.dir);
    const track = map.tracks[cart.loc.y][cart.loc.x];
    if (track in cartBends) {
      cart.dir = cartBends[track][cart.dir];
    } else if (track === '+') {
      cart.dir = cartIntersections[cart.turns % 3][cart.dir];
      cart.turns++;
    }
    const locs = new Counter(map.carts.map((c) => pointToString(c.loc)));
    const crashes = locs.mostCommon
      .filter(([loc, count]) => count > 1)
      .map(([loc, count]) => loc);
    for (const crash of crashes) {
      map.crashes.push(crash);
      map.carts = map.carts.filter((c) => pointToString(c.loc) !== crash);
    }
  }
  return map;
}

function firstCrash(map: Map): string {
  while (map.crashes.length === 0) {
    map = tick(map);
  }
  return map.crashes[0];
}

function lastCart(map: Map): string {
  while (map.carts.length > 1) {
    map = tick(map);
  }
  return pointToString(map.carts[0].loc);
}

example.equal(firstCrash(parse(load(13, 'ex1').raw)), '7,3');
example.equal(lastCart(parse(load(13, 'ex2').raw)), '6,4');

const map = parse(load(13).raw);
answers.expect('41,17', '134,117');
answers(
  () => firstCrash(map),
  () => lastCart(map)
);
