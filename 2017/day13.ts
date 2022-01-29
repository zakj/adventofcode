import { example, load, solve } from '../advent';

type ScannerMap = Map<number, number>; // depth -> range

function parse(lines: string[]): ScannerMap {
  return new Map(
    lines.map((line) => line.split(': ').map(Number) as [number, number])
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

const exampleScanners = parse(load('ex').lines);
example.equal(severity(0, exampleScanners), 24);
example.equal(safeDelay(exampleScanners), 10);

const scanners = parse(load().lines);
export default solve(
  () => severity(0, scanners),
  () => safeDelay(scanners)
).expect(2160, 3907470);
