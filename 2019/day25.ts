import { load, solve } from 'lib/advent';
import { compile, parse, Program } from './intcode';

type Room = {
  name: string;
  description: string;
  items: string[];
  exits: Map<string, string | null>;
};

const BAD_ITEMS = new Set([
  'escape pod', // halt: You're launched into space! Bye!
  'giant electromagnet', // Prevents you from moving but does not halt.
  'infinite loop', // yep
  'molten lava', // halt: The molten lava is way too hot! You melt!
  'photons', // halt: It is suddenly completely dark! You are eaten by a Grue!
]);
const REV_DIR = new Map([
  ['north', 'south'],
  ['east', 'west'],
  ['south', 'north'],
  ['west', 'east'],
]);

function parseRoom(s: string): Room {
  const room: Partial<Room> = {};
  const paras = s.trim().split('\n\n');
  for (const para of paras) {
    const lines = para.split('\n');
    if (lines[0].startsWith('==')) {
      room.name = lines.shift().split('==')[1].trim();
      room.description = lines.join('\n');
    } else if (lines[0].startsWith('Doors')) {
      room.exits = new Map(
        lines
          .slice(1)
          .map((line) => line.slice(2))
          .map((d) => [d, null])
      );
    } else if (lines[0].startsWith('Items')) {
      room.items = lines.slice(1).map((line) => line.slice(2));
    }
  }
  return Object.assign(
    { name: 'UNKNOWN', description: 'UNKNOWN', items: [], exits: new Map() },
    room
  );
}

function play(program: Program) {
  const droid = compile(program);
  const items: Set<string> = new Set();
  // assumes unique room names
  const map: Map<string, Room> = new Map();
  const path: string[] = [];

  const log: string[] = [];
  const cmd = (s?: string): string => {
    if (s) log.push(`> ${s}`);
    const rv = droid.ascii(s);
    log.push(rv.trim());
    return rv;
  };

  let dir: string;
  let prevRoom: Room;
  let hullBreachToSecurity: string[] = [];
  while (!droid.halted) {
    let room = parseRoom(cmd(dir));

    if (!map.has(room.name)) {
      // First visit to this room; record and gather items.
      map.set(room.name, room);
      for (const item of room.items) {
        if (BAD_ITEMS.has(item)) continue;
        const rv = cmd(`take ${item}`);
        if (droid.halted) throw `bad item: ${item}\n${rv}`;
        items.add(item);
      }
    } else {
      room = map.get(room.name);
    }
    if (prevRoom) {
      prevRoom.exits.set(dir, room.name);
      room.exits.set(REV_DIR.get(dir), prevRoom.name);
    }

    if (room.name === 'Security Checkpoint') {
      hullBreachToSecurity = path.slice();
      // South leads to Pressure-Sensitive Floor, which we'll deal with later.
      room.exits.delete('south');
    }

    const unknownExit = [...room.exits.entries()].find(([dir, name]) => !name);
    if (!unknownExit) {
      // Backtrack if we can, else we're back at the start with a complete map.
      if (path.length === 0) break;
      dir = REV_DIR.get(path.pop());
    } else {
      dir = unknownExit[0];
      path.push(dir);
    }
    prevRoom = room;
  }

  // We should now have a complete map and all safe items. We should be at Hull
  // Breach with a recorded path to Security. Go back to Security and check item
  // combinations.
  for (const dir of hullBreachToSecurity) cmd(dir);
  log.splice(0, log.length);

  function allCombinations<T>(xs: T[]): T[][] {
    if (xs.length === 0) return [[]];
    const [head, tail] = [xs[0], xs.slice(1)];
    const combos = allCombinations(tail);
    return [...combos, ...combos.map((c) => [...c, head])];
  }

  // Could be a little smarter here, but this runs fast enough.
  for (const comb of allCombinations(Array.from(items))) {
    for (const item of items) {
      cmd(`drop ${item}`);
    }
    for (const item of comb) {
      cmd(`take ${item}`);
    }
    const output = cmd('south');
    if (droid.halted) {
      return Number(output.match(/\d+/)[0]);
    }
  }
}

const program = parse(load().raw);
export default solve(() => play(program)).expect(196872);
