import { main } from 'lib/advent';
import { lines, sum } from 'lib/util';

type PatternEntry = {
  input: string[];
  output: string[];
};

function parse(lines: string[]): PatternEntry[] {
  return lines.map((line) => {
    const [input, output] = line.split(' | ');
    return { input: input.split(' '), output: output.split(' ') };
  });
}

type Segment = Set<string>;
const SEGMENTS: Segment[] = [
  new Set('abcefg'),
  new Set('cf'),
  new Set('acdeg'),
  new Set('acdfg'),
  new Set('bcdf'),
  new Set('abdfg'),
  new Set('abdefg'),
  new Set('acf'),
  new Set('abcdefg'),
  new Set('abcdfg'),
];

function intersect<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set<T>([...a].filter((x) => b.has(x)));
}

function hashSegment(s: Segment, four: Segment, seven: Segment): string {
  return `${s.size} ${intersect(s, four).size} ${intersect(s, seven).size}`;
}

const segmentHashes = new Map(
  SEGMENTS.map((set, i) => [hashSegment(set, SEGMENTS[4], SEGMENTS[7]), i])
);

function decodedOutput(entries: PatternEntry[]) {
  return sum(
    entries.map((entry) => {
      const four = new Set(
        entry.input.find((s) => s.length === SEGMENTS[4].size)
      );
      const seven = new Set(
        entry.input.find((s) => s.length === SEGMENTS[7].size)
      );
      return Number(
        entry.output
          .map((s) => segmentHashes.get(hashSegment(new Set(s), four, seven)))
          .join('')
      );
    })
  );
}

main(
  (s) => {
    return parse(lines(s))
      .flatMap((entry) => entry.output)
      .filter((x) => [2, 3, 4, 7].includes(x.length)).length;
  },
  (s) => decodedOutput(parse(lines(s)))
);
