import { example, load, solve } from 'lib/advent';
import { Counter } from 'lib/collections';
import { iter } from 'lib/iter';

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
    .map(([k]) => k)
    .slice(0, 5)
    .join('');
  return checksum === room.checksum;
}

function shiftCipher(room: Room): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return room.name
    .split('')
    .map((c) =>
      c === '-'
        ? ' '
        : alphabet[(alphabet.indexOf(c) + room.id) % alphabet.length]
    )
    .join('');
}

const exampleRooms = parse(load('ex').lines);
example.equal(exampleRooms.filter(isValidRoom).length, 3);
example.equal(
  shiftCipher(parse(['qzmt-zixmtkozy-ivhz-343[xxxxx]'])[0]),
  'very encrypted name'
);

const rooms = iter(parse(load().lines));
export default solve(
  () =>
    rooms
      .filter(isValidRoom)
      .map((r) => r.id)
      .sum(),
  () =>
    rooms
      .filter(isValidRoom)
      .find((room) => shiftCipher(room) === 'northpole object storage').id
).expect(409147, 991);
