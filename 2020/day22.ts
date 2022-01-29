import { example, load, solve } from 'lib/advent';
import { sum } from 'lib/util';

type Hand = number[];

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
  return hand.length ? sum(hand.map((c, i) => c * (hand.length - i))) : 0;
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
    let winner;
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

const exampleGame = parseGame(load('ex').paragraphs);
example.equal(306, Math.max(...play(exampleGame).map(score)));
example.equal(291, Math.max(...playRecursive(exampleGame)));

const game = parseGame(load().paragraphs);
export default solve(
  () => Math.max(...play(game).map(score)),
  () => Math.max(...playRecursive(game))
).expect(32629, 32519);
