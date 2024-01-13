import { main } from 'lib/advent';
import { allNumbers } from 'lib/util';

const MOD = 2147483647;
const [factorA, factorB] = [16807, 48271];

main(
  (s) => {
    // Generator approach is prettier but 8x slower.
    const [prevA, prevB] = allNumbers(s);
    let a = prevA;
    let b = prevB;
    let hits = 0;
    for (let i = 0; i < 40e6; ++i) {
      a = (a * factorA) % MOD;
      b = (b * factorB) % MOD;
      if ((a & 0xffff) === (b & 0xffff)) hits++;
    }
    return hits;
  },
  (s) => {
    const [prevA, prevB] = allNumbers(s);
    let a = prevA;
    let b = prevB;
    let hits = 0;
    for (let i = 0; i < 5e6; ++i) {
      do {
        a = (a * factorA) % MOD;
      } while (a & 3);
      do {
        b = (b * factorB) % MOD;
      } while (b & 7);
      if ((a & 0xffff) === (b & 0xffff)) hits++;
    }
    return hits;
  }
);
