import { example, load, solve } from 'lib/advent';
import { Iter, iter } from 'lib/iter';

type Packet = number | (Packet | number)[];
type Pair = [Packet, Packet];

function parse(paras: string[][]): Pair[] {
  return paras.map((lines) => {
    const [a, b] = lines;
    return [JSON.parse(a), JSON.parse(b)];
  });
}

function packetOrder(left: Packet, right: Packet): number {
  if (typeof left === 'number' && typeof right === 'number')
    return left - right;

  if (!Array.isArray(left)) left = [left];
  if (!Array.isArray(right)) right = [right];

  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; ++i) {
    const result = packetOrder(left[i], right[i]);
    if (result !== 0) return result;
  }
  return left.length - right.length;
}

function orderedIndexes(pairs: Pair[]): Iter<number> {
  return iter(pairs)
    .map(([left, right], i) => [packetOrder(left, right), i + 1])
    .filter(([order]) => order < 0)
    .map(([, index]) => index);
}

function decoderKey(pairs: Pair[], a: Packet, b: Packet): number {
  const packets = [a, b, ...pairs.flat(1)];
  packets.sort(packetOrder);
  return (
    (packets.findIndex((x) => x === a) + 1) *
    (packets.findIndex((x) => x === b) + 1)
  );
}

const exampleData = parse(load('ex').paragraphs);
example.equal(13, orderedIndexes(exampleData).sum());
example.equal(140, decoderKey(exampleData, [[2]], [[6]]));

const data = parse(load().paragraphs);
export default solve(
  () => orderedIndexes(data).sum(),
  () => decoderKey(data, [[2]], [[6]])
).expect(5503, 20952);
