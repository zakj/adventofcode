import { main } from 'lib/advent';
import { chunks, range } from 'lib/util';
import { compile, parse } from './intcode';

main(
  (s) => {
    const computers = range(0, 50).map((addr) => compile(parse(s), addr));
    let packets: number[][] = [];
    for (;;) {
      packets = packets.concat(computers.flatMap((c) => chunks(c(-1), 3)));
      while (packets.length) {
        const [addr, x, y] = packets.pop();
        if (addr === 255) return y;
        packets = packets.concat(chunks(computers[addr](x, y), 3));
      }
    }
  },
  (s) => {
    const computers = range(0, 50).map((addr) => compile(parse(s), addr));
    let packets: number[][] = [];
    let natSentY = NaN;
    let nat: { x: number; y: number };
    for (;;) {
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
);
