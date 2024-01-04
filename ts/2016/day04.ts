import { main } from 'lib/advent';
import { Counter } from 'lib/collections';
import { Iter, iter } from 'lib/iter';
import { lines } from 'lib/util';

type Room = {
  name: string;
  id: number;
  checksum: string;
};

function parse(input: string): Iter<Room> {
  const re = /^(?<name>[-a-z]+)-(?<id>\d+)\[(?<checksum>[a-z]{5})\]$/;
  return iter(lines(input)).map((line) => {
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

main(
  (s) =>
    parse(s)
      .filter(isValidRoom)
      .map((r) => r.id)
      .sum(),
  (s) =>
    parse(s)
      .filter(isValidRoom)
      .find((room) => shiftCipher(room) === 'northpole object storage').id
);
