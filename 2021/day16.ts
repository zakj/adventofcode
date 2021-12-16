import { answers, load } from '../advent';
import { product, sum } from '../util';

function parse(s: string): string {
  return s
    .trim()
    .split('')
    .map((s) => parseInt(s, 16).toString(2).padStart(4, '0'))
    .join('');
}

enum PacketType {
  Sum = 0,
  Product = 1,
  Minimum = 2,
  Maximum = 3,
  Literal = 4,
  GreaterThan = 5,
  LessThan = 6,
  EqualTo = 7,
}

const nextMultiple = (val: number, of: number): number =>
  Math.ceil(val / of) * of;

type BasePacket = {
  version: number;
  type: number;
};
type LiteralPacket = BasePacket & {
  type: PacketType.Literal;
  value: number;
};
type OperatorPacket = BasePacket & {
  lengthType: '0' | '1';
  length: number;
  packets: Packet[];
};

type Packet = LiteralPacket | OperatorPacket;

function parsePacket(input: string): {
  packet: Packet;
  read: number;
  remainder: string;
} {
  let arr = input.split('');
  const version = parseInt(arr.splice(0, 3).join(''), 2);
  const type = parseInt(arr.splice(0, 3).join(''), 2);
  let readCount = 6;
  switch (type) {
    case PacketType.Literal:
      let head: string;
      let bits = [];
      do {
        head = arr.shift();
        bits = [...bits, ...arr.splice(0, 4)];
        readCount += 5;
      } while (head === '1');
      // if (arr.some((v) => v !== '0')) throw `bad trailing characters, ${arr}`;
      return {
        packet: {
          version,
          type,
          value: parseInt(bits.join(''), 2),
        },
        read: readCount,
        remainder: arr.join(''),
      };
    default:
      const lengthType = arr.shift();
      readCount += 1;
      let length;
      if (lengthType === '0') {
        length = parseInt(arr.splice(0, 15).join(''), 2);
        readCount += 15;
      } else if (lengthType === '1') {
        length = parseInt(arr.splice(0, 11).join(''), 2);
        readCount += 11;
      } else throw 'bad lengthType';
      const packet: OperatorPacket = {
        version,
        type,
        lengthType,
        length,
        packets: [],
      };
      let readSubBits = 0;
      let readPackets = 0;
      while (
        (lengthType === '0' && readSubBits < length) ||
        (lengthType === '1' && readPackets < length)
      ) {
        const rv = parsePacket(arr.join(''));
        packet.packets.push(rv.packet);
        readSubBits += rv.read;
        readPackets++;
        arr = rv.remainder.split('');
      }
      return { packet, read: readCount + readSubBits, remainder: arr.join('') };
  }
}

function isLiteral(packet: Packet): packet is LiteralPacket {
  return packet.type === PacketType.Literal;
}

function sumVersion(packet: Packet): number {
  if (isLiteral(packet)) {
    return packet.version;
  } else {
    return packet.version + sum(packet.packets.map((p) => sumVersion(p)));
  }
}

function evaluate(packet: Packet): number {
  switch (packet.type) {
    case PacketType.Sum:
      return sum(packet.packets.map((p) => evaluate(p)));
    case PacketType.Product:
      return product(packet.packets.map((p) => evaluate(p)));
    case PacketType.Minimum:
      return Math.min(...packet.packets.map((p) => evaluate(p)));
    case PacketType.Maximum:
      return Math.max(...packet.packets.map((p) => evaluate(p)));
    case PacketType.Literal:
      return (packet as LiteralPacket).value;
    case PacketType.GreaterThan:
      return evaluate(packet.packets[0]) > evaluate(packet.packets[1]) ? 1 : 0;
    case PacketType.LessThan:
      return evaluate(packet.packets[0]) < evaluate(packet.packets[1]) ? 1 : 0;
    case PacketType.EqualTo:
      return evaluate(packet.packets[0]) === evaluate(packet.packets[1])
        ? 1
        : 0;
  }
  return 0;
}

const data = parse(load(16).raw);
answers.expect(943, 167737115857);
answers(
  () => sumVersion(parsePacket(data).packet),
  () => evaluate(parsePacket(data).packet)
);
