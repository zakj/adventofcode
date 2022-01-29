import { example, load, solve } from 'lib/advent';

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

example.equal(playMarbles(9, 25), 32);
example.equal(playMarbles(10, 1618), 8317);
example.equal(playMarbles(13, 7999), 146373);
example.equal(playMarbles(17, 1104), 2764);
example.equal(playMarbles(21, 6111), 54718);
example.equal(playMarbles(30, 5807), 37305);

const [players, lastMarble] = parse(load().raw);
export default solve(
  () => playMarbles(players, lastMarble),
  () => playMarbles(players, lastMarble * 100)
).expect(429943, 3615691746);
