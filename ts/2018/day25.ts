import { main } from 'lib/advent';
import { lines } from 'lib/util';

type Star = [x: number, y: number, z: number, t: number];
type Constellation = Star[];

function parse(lines: string[]): Star[] {
  return lines.map((line) => line.split(',').map(Number) as Star);
}

function distance(a: Star, b: Star): number {
  return (
    Math.abs(a[0] - b[0]) +
    Math.abs(a[1] - b[1]) +
    Math.abs(a[2] - b[2]) +
    Math.abs(a[3] - b[3])
  );
}

function mergeConstellations(stars: Star[]): Constellation[] {
  let constellations: Constellation[] = stars.map((s) => [s]);
  let merged: boolean;
  do {
    merged = false;
    for (let i = 0; i < constellations.length; ++i) {
      for (let j = i + 1; j < constellations.length; ++j) {
        const a = constellations[i];
        const b = constellations[j];
        for (const star of a) {
          if (b.some((other) => distance(star, other) <= 3)) {
            constellations[i] = [].concat(a, b);
            constellations[j] = [];
            merged = true;
          }
        }
      }
    }
    constellations = constellations.filter((c) => c.length);
  } while (merged);
  return constellations;
}

main((s) => mergeConstellations(parse(lines(s))).length);
