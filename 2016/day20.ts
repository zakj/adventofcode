import { example, load, solve } from '../advent';
import { pairs } from '../util';

type Blocklist = [from: bigint, to: bigint][];
const MAX_IP = 4294967295n;

function parse(lines: string[]): Blocklist {
  return lines
    .map((line) => line.split('-').map(BigInt) as [bigint, bigint])
    .sort((a, b) => Number(a[0] - b[0]));
}

function merged(blocklist: Blocklist): Blocklist {
  const merged = [blocklist[0]];
  for (let [from, to] of blocklist.slice(1)) {
    const prev = merged[merged.length - 1];
    if (from <= prev[1] + 1n) {
      if (to > prev[1]) prev[1] = to;
    } else {
      merged.push([from, to]);
    }
  }
  return merged;
}

function lowestNonBlocked(blocklist: Blocklist): bigint {
  return merged(blocklist)[0][1] + 1n;
}

function countAllowed(blocklist: Blocklist, max: bigint): bigint {
  const mergedBlocklist = merged(blocklist);
  return (
    pairs(mergedBlocklist).reduce(
      (count, [low, high]) => count + high[0] - low[1] - 1n,
      0n
    ) +
    max -
    mergedBlocklist[mergedBlocklist.length - 1][1]
  );
}

const exampleBlocklist = parse(['5-8', '0-2', '4-7']);
example.equal(lowestNonBlocked(exampleBlocklist), 3n);
example.equal(countAllowed(exampleBlocklist, 9n), 2n);

const blocklist = parse(load().lines);
export default solve(
  () => lowestNonBlocked(blocklist),
  () => countAllowed(blocklist, MAX_IP)
).expect(22887907n, 109n);
