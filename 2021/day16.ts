import { answers, load } from '../advent';
import { product, sum, ValuesOf } from '../util';

function parse(s: string): number[] {
  return s
    .trim()
    .split('')
    .flatMap((c) => parseInt(c, 16).toString(2).padStart(4, '0').split(''))
    .map(Number);
}

const PacketType = {
  Sum: 0,
  Product: 1,
  Minimum: 2,
  Maximum: 3,
  Literal: 4,
  GreaterThan: 5,
  LessThan: 6,
  EqualTo: 7,
} as const;
type PacketType = ValuesOf<typeof PacketType>;

type LiteralPacket = {
  version: number;
  type: Extract<PacketType, 4>;
  value: number;
};
type OperatorPacket = {
  version: number;
  type: Exclude<PacketType, LiteralPacket['type']>;
  packets: Packet[];
};
type Packet = LiteralPacket | OperatorPacket;

function parsePacket(input: number[]): {
  packet: Packet;
  read: number;
  remainder: number[];
} {
  let arr = input.slice(); // don't mutate the input
  let readCount = 0;
  const readInt = (len: number): number => {
    readCount += len;
    return parseInt(arr.splice(0, len).join(''), 2);
  };

  const version = readInt(3);
  const type = readInt(3) as PacketType;
  let packet: Packet;

  if (type === PacketType.Literal) {
    let bits = [];
    while (true) {
      const head = readInt(1);
      bits.push(...arr.splice(0, 4));
      readCount += 4;
      if (head === 0) break;
    }
    packet = { version, type, value: parseInt(bits.join(''), 2) };
  } else {
    const lengthType = readInt(1);
    let length = readInt(lengthType === 0 ? 15 : 11);
    let readSubBits = 0;
    let readPackets = 0;
    const packets: Packet[] = [];
    while (
      (lengthType === 0 && readSubBits < length) ||
      (lengthType === 1 && readPackets < length)
    ) {
      const rv = parsePacket(arr);
      packets.push(rv.packet);
      readSubBits += rv.read;
      readPackets++;
      arr = rv.remainder;
    }
    readCount += readSubBits;
    packet = { version, type, packets };
  }
  return { packet, read: readCount, remainder: arr };
}

function sumVersion(packet: Packet): number {
  if (packet.type === PacketType.Literal) {
    return packet.version;
  } else {
    return packet.version + sum(packet.packets.map(sumVersion));
  }
}

function evaluate(packet: Packet): number {
  const values = 'packets' in packet ? packet.packets.map(evaluate) : null;
  switch (packet.type) {
    case PacketType.Sum:
      return sum(values);
    case PacketType.Product:
      return product(values);
    case PacketType.Minimum:
      return Math.min(...values);
    case PacketType.Maximum:
      return Math.max(...values);
    case PacketType.Literal:
      return packet.value;
    case PacketType.GreaterThan:
      return values[0] > values[1] ? 1 : 0;
    case PacketType.LessThan:
      return values[0] < values[1] ? 1 : 0;
    case PacketType.EqualTo:
      return values[0] === values[1] ? 1 : 0;
  }
  return 0;
}

const data = parse(load(16).raw);
answers.expect(943, 167737115857);
answers(
  () => sumVersion(parsePacket(data).packet),
  () => evaluate(parsePacket(data).packet)
);
