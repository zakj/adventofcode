import { answers, load } from '../advent';

enum Technique {
  Deal,
  Cut,
}
type Deck = number[];
type Shuffle = [Technique, number][];

function parse(lines: string[]): Shuffle {
  const re = /^(\w+) .* (-?\d+)?$/;
  return lines.map((line) => {
    const words = line.split(' ');
    let technique: Technique;
    switch (words[0]) {
      case 'deal':
        technique = Technique.Deal;
        break;
      case 'cut':
        technique = Technique.Cut;
        break;
      default:
        throw 'parse error';
    }
    const n = Number(words[words.length - 1]);
    return [technique, isNaN(n) ? 0 : n];
  });
}

const makeDeck = (n: number): number[] => [...Array(n).keys()];

function shuffle(deck: Deck, shuffle: Shuffle): Deck {
  for (const [technique, n] of shuffle) {
    switch (technique) {
      case Technique.Deal:
        if (n === 0) {
          deck.reverse();
        } else {
          const d: Deck = new Array(deck.length);
          let ptr = 0;
          for (let i = 0; i < deck.length; ++i) {
            d[ptr] = deck[i];
            ptr = (ptr + n) % deck.length;
          }
          deck = d;
        }
        break;
      case Technique.Cut:
        const d = deck.slice();
        if (n >= 0) {
          const cut = d.splice(0, n);
          d.splice(d.length, 0, ...cut);
        } else {
          const cut = d.splice(n, Math.abs(n));
          d.splice(0, 0, ...cut);
        }
        deck = d;
        break;
    }
  }

  return deck;
}

function powMod(base: bigint, exp: bigint, mod: bigint): bigint {
  if (exp === 0n) return 1n;
  if (exp % 2n === 0n) return powMod(base, exp / 2n, mod) ** 2n % mod;
  return (base * powMod(base, exp - 1n, mod)) % mod;
}

// Only works where mod is prime; Euler's theorem
function modInv(n: bigint, mod: bigint): bigint {
  return powMod(n, mod - 2n, mod);
}

// Stolen from https://github.com/mcpower/adventofcode/blob/501b66084b0060e0375fc3d78460fb549bc7dfab/2019/22/a-improved.py
function shuffle2(
  deckSize: bigint,
  shuffle: Shuffle
): { offset: bigint; increment: bigint } {
  let offset = 0n;
  let increment = 1n;
  for (const [technique, n] of shuffle) {
    if (technique === Technique.Deal) {
      if (n === 0) {
        increment = (increment * -1n) % deckSize;
        offset = (offset + increment) % deckSize;
      } else {
        increment = (increment * modInv(BigInt(n), deckSize)) % deckSize;
      }
    } else if (technique === Technique.Cut) {
      offset = (offset + increment * BigInt(n)) % deckSize;
    }
  }
  return { offset, increment };
}

const instructions = parse(load(22).lines);
answers.expect(7744, 57817797345992n);
answers(
  () => shuffle(makeDeck(10007), instructions).findIndex((c) => c === 2019),
  () => {
    const deckSize = 119315717514047n;
    const shuffleTimes = 101741582076661n;
    let { offset, increment } = shuffle2(deckSize, instructions);
    const incrementIter = powMod(increment, shuffleTimes, deckSize);
    const offsetIter =
      (offset *
        (1n - incrementIter) *
        modInv((1n - increment) % deckSize, deckSize)) %
      deckSize;
    return (offsetIter + 2020n * incrementIter) % deckSize;
  }
);
