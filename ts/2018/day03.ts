import { main } from 'lib/advent';
import { lines } from 'lib/util';

type Claim = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

function parse(s: string): Claim[] {
  const re = /^#(\d+) @ (\d+),(\d+): (\d+)x(\d+)$/;
  return lines(s).map((line) => {
    const match = line.match(re);
    return {
      id: Number(match[1]),
      x: Number(match[2]),
      y: Number(match[3]),
      w: Number(match[4]),
      h: Number(match[5]),
    };
  });
}

function coords(claim: Claim): string[] {
  const s = [];
  for (let x = claim.x; x < claim.x + claim.w; ++x) {
    for (let y = claim.y; y < claim.y + claim.h; ++y) {
      s.push(`${x},${y}`);
    }
  }
  return s;
}

function overlaps(claims: Claim[]): Set<string> {
  const overlap = new Set<string>();
  const seen = new Set<string>();
  for (const coord of claims.flatMap(coords)) {
    if (seen.has(coord)) overlap.add(coord);
    else seen.add(coord);
  }
  return overlap;
}

function withoutOverlaps(claims: Claim[]): number {
  const overlapCoords = overlaps(claims);
  return claims.find((claim) =>
    coords(claim).every((coord) => !overlapCoords.has(coord))
  ).id;
}

main(
  (s) => overlaps(parse(s)).size,
  (s) => withoutOverlaps(parse(s))
);
