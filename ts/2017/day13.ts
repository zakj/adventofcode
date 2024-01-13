import { main } from 'lib/advent';
import { lines } from 'lib/util';

type ScannerMap = Map<number, number>; // depth -> range

function parse(s: string): ScannerMap {
  return new Map(
    lines(s).map((line) => line.split(': ').map(Number) as [number, number])
  );
}

function severity(time: number, scanners: ScannerMap): number {
  let severity = 0;
  for (const [depth, scanRange] of scanners.entries()) {
    const scannerAt = (depth + time) % (scanRange * 2 - 2);
    if (scannerAt === 0) severity += depth * scanRange;
  }
  return severity;
}

function isSafe(time: number, scanners: ScannerMap): boolean {
  for (const [depth, scanRange] of scanners.entries()) {
    const scannerAt = (depth + time) % (scanRange * 2 - 2);
    if (scannerAt === 0) return false;
  }
  return true;
}

function safeDelay(scanners: ScannerMap): number {
  for (let i = 0; ; ++i) {
    if (isSafe(i, scanners)) return i;
  }
}

main(
  (s) => severity(0, parse(s)),
  (s) => safeDelay(parse(s))
);
