import util from 'util';
import { example, load, solve } from '../advent';
import { cartesianProduct, combinations, permutations, XSet } from '../util';

class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(values: [number, number, number]) {
    this.x = values[0];
    this.y = values[1];
    this.z = values[2];
  }

  [util.inspect.custom]() {
    return [this.x, this.y, this.z];
  }

  difference(other: Vector3): Vector3 {
    return new Vector3([this.x - other.x, this.y - other.y, this.z - other.z]);
  }

  distance(other: Vector3): number {
    const delta = this.difference(other);
    return Math.abs(delta.x) + Math.abs(delta.y) + Math.abs(delta.z);
  }

  equals(other: Vector3): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  hash(): string {
    return [
      Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z),
      Math.min(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)),
      Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)),
    ].join(',');
  }

  multiply(matrix: Matrix3x3): Vector3 {
    const [a, b, c, d, e, f, g, h, i] = matrix.flat();
    return new Vector3([
      this.x * a + this.y * b + this.z * c,
      this.x * d + this.y * e + this.z * f,
      this.x * g + this.y * h + this.z * i,
    ]);
  }

  sum(other: Vector3): Vector3 {
    return new Vector3([this.x + other.x, this.y + other.y, this.z + other.z]);
  }
}

class Matrix3x3 {
  #values: number[][];

  constructor(arr: number[][]) {
    if (arr.length !== 3 || arr[0].length !== 3) throw 'must be a 3x3 array';
    this.#values = arr;
  }

  [util.inspect.custom]() {
    const pad = Math.max(
      ...this.#values.flat().map((v) => v.toString().length)
    );
    const valStr = (x: number) => x.toString().padStart(pad);
    return this.#values
      .map((row) => `| ${row.map(valStr).join(' ')} |`)
      .join('\n');
  }

  get determinant() {
    // https://en.wikipedia.org/wiki/Determinant
    const [a, b, c, d, e, f, g, h, i] = this.#values.flat();
    return (
      a * e * i + b * f * g + c * d * h - c * e * g - b * d * i - a * f * h
    );
  }

  flat() {
    return this.#values.flat();
  }
}

type Report = Vector3[];

const ORIENTATIONS = cartesianProduct([-1, 1], [-1, 1], [-1, 1])
  .flatMap(([x, y, z]) => [
    ...permutations([
      [x, 0, 0],
      [0, y, 0],
      [0, 0, z],
    ]),
  ])
  .map((perm) => new Matrix3x3(perm))
  .filter((m) => m.determinant === 1);

function parse(paras: string[][]): Report[] {
  return paras.map((para) =>
    para.slice(1).map((line) => {
      const [x, y, z] = line.split(',', 3).map(Number);
      return new Vector3([x, y, z]);
    })
  );
}

function getBeaconDeltas(beacons: Vector3[]): [string, [Vector3, Vector3]][] {
  // record vectors between pairs of beacons, alongside their source beacons
  return [...combinations(beacons)].map(([a, b]) => [
    a.difference(b).hash(),
    [a, b] as [Vector3, Vector3],
  ]);
}

function orientBeacons(
  known: XSet<Vector3>,
  report: Report
): { beacons: Vector3[]; scanner: Vector3 } {
  const knownDeltas = getBeaconDeltas([...known]);
  const reportDeltas = getBeaconDeltas(report);
  const matches: [Vector3, Vector3, Vector3, Vector3][] = [];
  for (const [knownHash, [k1, k2]] of knownDeltas) {
    for (const [reportHash, [r1, r2]] of reportDeltas) {
      if (knownHash === reportHash) {
        matches.push([k1, k2, r1, r2]);
      }
    }
  }

  // needs at least 66 (12 choose 2) matching fingerprints
  if (matches.length < 66) return;

  let count = 0;
  for (const [k1, k2, r1, r2] of matches) {
    const orientation = ORIENTATIONS.find((rot) =>
      k1.difference(r1.multiply(rot)).equals(k2.difference(r2.multiply(rot)))
    );
    if (orientation) {
      const offset = k1.difference(r1.multiply(orientation));
      const translated = report.map((v) => v.multiply(orientation).sum(offset));
      if (translated.filter((v) => known.has(v)).length >= 12) {
        return { beacons: translated, scanner: offset };
      }
    }
  }
}

function mapSpace(reports: Report[]): {
  beacons: Vector3[];
  scanners: Vector3[];
} {
  // Start with scanner 0 at the center.
  const scanners = [new Vector3([0, 0, 0])];
  const knownBeacons = new XSet((b) => b.hash(), reports[0]);
  const toSearch = reports.slice(1);

  while (toSearch.length) {
    const report = toSearch.shift();
    const found = orientBeacons(knownBeacons, report);
    if (found) {
      found.beacons.forEach((f) => knownBeacons.add(f));
      scanners.push(found.scanner);
    } else {
      toSearch.push(report);
    }
  }

  return { beacons: [...knownBeacons], scanners };
}

function maxDistance(xs: Vector3[]): number {
  return Math.max(...[...combinations(xs)].map(([a, b]) => a.distance(b)));
}

const exampleReports = parse(load('ex').paragraphs);
example.equal(mapSpace(exampleReports).beacons.length, 79);
example.equal(maxDistance(mapSpace(exampleReports).scanners), 3621);

const reports = parse(load().paragraphs);
let scanners: Vector3[]; // XXX timing cheat
export default solve(
  () => {
    const result = mapSpace(reports);
    scanners = result.scanners;
    return result.beacons.length;
  },
  () => maxDistance(scanners)
).expect(419, 13210);
