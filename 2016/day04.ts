import { answers, example, load } from '../advent';
import { Counter, sum } from '../util';

type Room = {
  name: string;
  id: number;
  checksum: string;
};

function parse(lines: string[]): Room[] {
  const re = /^(?<name>[-a-z]+)-(?<id>\d+)\[(?<checksum>[a-z]{5})\]$/;
  return lines.map((line) => {
    const match = line.match(re);
    return {
      name: match.groups.name,
      id: Number(match.groups.id),
      checksum: match.groups.checksum,
    };
  });
}

function isValidRoom(room: Room): boolean {
  const counter = new Counter(room.name.replaceAll('-', '').split(''));
  const checksum = [...counter.entries()]
    .sort(([aChar, aCount], [bChar, bCount]) => {
      if (aCount === bCount) {
        if (aChar < bChar) return -1;
        return 1;
      }
      return bCount - aCount;
    })
    .map(([k, v]) => k)
    .slice(0, 5)
    .join('');
  return checksum === room.checksum;
}

function shiftCipher(room: Room): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return room.name
    .split('')
    .map((c) => {
      if (c === '-') return ' ';
      const i = alphabet.findIndex((x) => x === c);
      return alphabet[(i + room.id) % alphabet.length];
    })
    .join('');
}

const exampleRooms = parse(load(4, 'ex').lines);
example.equal(exampleRooms.filter(isValidRoom).length, 3);
example.equal(
  shiftCipher(parse(['qzmt-zixmtkozy-ivhz-343[xxxxx]'])[0]),
  'very encrypted name'
);

const rooms = parse(load(4).lines);
answers(
  () => sum(rooms.filter(isValidRoom).map((r) => r.id)),
  () =>
    rooms
      .filter(isValidRoom)
      .find((room) => shiftCipher(room) === 'northpole object storage').id
);
