import { main } from 'lib/advent';
import { paragraphs, sum } from 'lib/util';

type Hand = number[];
type Player = 1 | 2;

function parseGame(games: string[][]): Hand[] {
  return games.map((player) => player.slice(1).map(Number));
}

function play(hands: Hand[]): Hand[] {
  let [p1, p2] = [[...hands[0]], [...hands[1]]];
  while (p1.length && p2.length) {
    const [a, b] = [p1.shift(), p2.shift()];
    if (a > b) p1 = p1.concat([a, b]);
    else p2 = p2.concat([b, a]);
  }
  return [p1, p2];
}

function score(hand: Hand): number {
  return sum(hand.map((c, i) => c * (hand.length - i)));
}

function checkAndCache(cache: Set<string>, hands: Hand[]): boolean {
  const key = hands.map((h) => h.join(',')).join(' ');
  if (cache.has(key)) return true;
  cache.add(key);
  return false;
}

function playRecursive(hands: Hand[]): [number, number] {
  let [p1, p2] = [[...hands[0]], [...hands[1]]];
  const cache = new Set<string>();
  while (p1.length && p2.length) {
    if (checkAndCache(cache, [p1, p2])) return [1, 0];
    const [a, b] = [p1.shift(), p2.shift()];
    let winner: Player;
    if (a <= p1.length && b <= p2.length) {
      const scores = playRecursive([p1.slice(0, a), p2.slice(0, b)]);
      winner = scores[0] > scores[1] ? 1 : 2;
    } else {
      winner = a > b ? 1 : 2;
    }
    if (winner === 1) p1 = p1.concat([a, b]);
    else p2 = p2.concat([b, a]);
  }
  return [score(p1), score(p2)];
}

main(
  (s) => Math.max(...play(parseGame(paragraphs(s))).map(score)),
  (s) => Math.max(...playRecursive(parseGame(paragraphs(s))))
);
