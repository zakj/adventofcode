import { load, solve } from '../advent';
import { chunks, range } from '../util';
import { compile, parse } from './intcode';

const program = parse(load().raw);
export default solve(
  () => {
    const computers = range(0, 50).map((addr) => compile(program, addr));
    let packets: number[][] = [];
    while (true) {
      packets = packets.concat(computers.flatMap((c) => chunks(c(-1), 3)));
      while (packets.length) {
        const [addr, x, y] = packets.pop();
        if (addr === 255) return y;
        packets = packets.concat(chunks(computers[addr](x, y), 3));
      }
    }
  },
  () => {
    const computers = range(0, 50).map((addr) => compile(program, addr));
    let packets: number[][] = [];
    let natSentY: number = NaN;
    let nat: { x: number; y: number };
    while (true) {
      packets = packets.concat(computers.flatMap((c) => chunks(c(-1), 3)));
      while (packets.length) {
        const [addr, x, y] = packets.pop();
        if (addr === 255) {
          nat = { x, y };
          continue;
        }
        packets = packets.concat(chunks(computers[addr](x, y), 3));
      }
      if (natSentY === nat.y) return nat.y;
      natSentY = nat.y;
      packets = chunks(computers[0](nat.x, nat.y), 3);
    }
  }
).expect(19530, 12725);
