import { answers, example, load } from './advent';
import { combinations, range } from './util';

type Component = string;
type Floors = Component[][];
type State = {
  elevatorAt: number;
  floors: Floors;
};
type Move = {
  components: Component[];
  to: number;
};

function parse(lines: string[]): Floors {
  const re = new RegExp(
    `(?<element>\\w+)` +
      `(?:` +
      `(?<microchip>-compatible microchip)|(?<generator> generator)` +
      `)`,
    'g'
  );
  return lines.map((line) =>
    [...line.matchAll(re)]
      .map((m) => m.groups.element[0] + (m.groups.microchip ? 'm' : 'g'))
      .map((s) => s.toUpperCase())
  );
}

const getElement = (c: Component): string => c[0];
const getType = (c: Component): string => c[1];
const isGenerator = (c: Component): boolean => getType(c) === 'G';
const isMicrochip = (c: Component): boolean => getType(c) === 'M';

function isSafe({ floors }: State): boolean {
  return floors.every((floor) => {
    const generators = new Set(floor.filter(isGenerator).map(getElement));
    return (
      generators.size === 0 ||
      floor
        .filter(isMicrochip)
        .map(getElement)
        .every((chip) => generators.has(chip))
    );
  });
}

function applyMove({ floors, elevatorAt }: State, move: Move): State {
  floors = floors.map((f) => [...f]);
  floors[elevatorAt] = floors[elevatorAt].filter(
    (c) => !move.components.includes(c)
  );
  floors[move.to] = floors[move.to].concat(move.components);
  return { floors, elevatorAt: move.to };
}

function hashify({ floors, elevatorAt }: State): string {
  return JSON.stringify({
    elevatorAt,
    floors: floors.map((f) => f.sort()),
  });
}

function stringState({ floors, elevatorAt }: State): string {
  const components = floors.flat();
  components.sort();
  return range(floors.length - 1, -1)
    .map((i) => {
      const floor = floors[i];
      return [`F${i + 1} ${elevatorAt === i ? 'E' : '.'} `]
        .concat(components.map((c) => (floor.includes(c) ? c : '. ')))
        .join(' ');
    })
    .join('\n');
}

function minPath(start: State): State[] {
  const q: { state: State; path: State[] }[] = [{ state: start, path: [] }];
  const visited = new Set<string>();

  while (q.length) {
    const { state, path } = q.shift();
    const { floors, elevatorAt } = state;
    if (floors.slice(0, floors.length - 1).flat().length === 0) {
      return path.concat(state);
    }

    const floor = floors[elevatorAt];
    const floorOptions = [elevatorAt + 1, elevatorAt - 1].filter(
      (i) =>
        i >= 0 &&
        i < floors.length &&
        (i === 0 || floors.slice(0, i).flat().length > 0)
    );
    const componentOptions = [].concat(
      [...combinations(floor)],
      floor.map((c) => [c])
    );
    const moveOptions = floorOptions.flatMap((to) =>
      componentOptions.map((components) => ({ components, to }))
    );

    let movedTwoUp = false;
    let movedOneDown = false;
    moveOptions
      .map((move) => {
        const newState = applyMove(state, move);
        const hash = hashify(newState);
        return { move, newState, hash };
      })
      .filter(({ move, newState, hash }) => {
        if (visited.has(hash)) return false;
        visited.add(hash);
        if (!isSafe(newState)) return false;
        if (move.to > elevatorAt) {
          if (move.components.length === 2) movedTwoUp = true;
          else if (movedTwoUp) return false;
        } else {
          if (move.components.length === 1) movedOneDown = true;
          else if (movedOneDown) return false;
        }
        return true;
      })
      .forEach(({ newState, hash }) => {
        visited.add(hash);
        q.push({ state: newState, path: path.concat(state) });
      });
  }
}

const exampleFloors = parse(load(11, 'ex').lines);
example.equal(minPath({ floors: exampleFloors, elevatorAt: 0 }).length - 1, 11);

const floors = parse(load(11).lines);
answers(
  () => minPath({ floors, elevatorAt: 0 }).length - 1,
);
