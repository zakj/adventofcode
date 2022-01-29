import { load, solve } from '../advent';

type Claim = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

function parse(lines: string[]): Claim[] {
  const re = /^#(\d+) @ (\d+),(\d+): (\d+)x(\d+)$/;
  return lines.map((line) => {
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

const claims = parse(load().lines);
export default solve(
  () => overlaps(claims).size,
  () => withoutOverlaps(claims)
).expect(101781, 909);
