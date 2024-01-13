import { main } from 'lib/advent';

type Marble = {
  value: number;
  next: Marble;
  prev: Marble;
};

function parse(s: string): [players: number, lastMarble: number] {
  const words = s.split(' ');
  return [Number(words[0]), Number(words[6])];
}

function playMarbles(playerCount: number, lastMarble: number): number {
  let current: Marble = { value: 0, next: null, prev: null };
  current.next = current.prev = current;
  const scores = new Map<number, number>();

  for (let marble = 1; marble <= lastMarble; ++marble) {
    if (marble % 23 === 0) {
      for (let i = 0; i < 7; ++i) {
        current = current.prev;
      }
      [current.prev.next, current.next.prev] = [current.next, current.prev];
      const player = marble % playerCount;
      const score = marble + current.value + (scores.get(player) || 0);
      scores.set(player, score);
      current = current.next;
    } else {
      current = current.next;
      const next = { value: marble, next: current.next, prev: current };
      current.next.prev = next;
      current.next = next;
      current = next;
    }
  }

  return Math.max(...scores.values());
}

main(
  (s) => playMarbles(...parse(s)),
  (s) => {
    const [players, lastMarble] = parse(s);
    return playMarbles(players, lastMarble * 100);
  }
);
