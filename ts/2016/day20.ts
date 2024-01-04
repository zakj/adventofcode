import { main } from 'lib/advent';
import { lines, pairs } from 'lib/util';

type Blocklist = [from: bigint, to: bigint][];

function parse(s: string): Blocklist {
  return lines(s)
    .map((line) => line.split('-').map(BigInt) as [bigint, bigint])
    .sort((a, b) => Number(a[0] - b[0]));
}

function merged(blocklist: Blocklist): Blocklist {
  const merged = [blocklist[0]];
  for (const [from, to] of blocklist.slice(1)) {
    const prev = merged[merged.length - 1];
    if (from <= prev[1] + 1n) {
      if (to > prev[1]) prev[1] = to;
    } else {
      merged.push([from, to]);
    }
  }
  return merged;
}

function lowestNonBlocked(blocklist: Blocklist): number {
  return Number(merged(blocklist)[0][1]) + 1;
}

function countAllowed(blocklist: Blocklist, max: bigint): number {
  const mergedBlocklist = merged(blocklist);
  return Number(
    pairs(mergedBlocklist).reduce(
      (count, [low, high]) => count + high[0] - low[1] - 1n,
      0n
    ) +
      max -
      mergedBlocklist[mergedBlocklist.length - 1][1]
  );
}

main(
  (s) => lowestNonBlocked(parse(s)),
  (s, { max_ip }) => countAllowed(parse(s), BigInt(max_ip as number))
);
