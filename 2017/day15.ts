import { load, solve } from 'lib/advent';

const MOD = 2147483647;

const [factorA, factorB] = [16807, 48271];
const [prevA, prevB] = load().lines.map((l) => Number(l.split(/\s+/).pop()));

export default solve(
  () => {
    // Generator approach is prettier but 8x slower.
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
  () => {
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
).expect(573, 294);
