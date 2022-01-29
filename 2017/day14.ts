import { example, load, solve } from '../advent';
import { knotHash } from './knot-hash';

type Grid = boolean[][];

function hexToBits(x: string): boolean[] {
  const bin = parseInt(x, 16).toString(2);
  return `000${bin}`
    .split('')
    .slice(-4)
    .map((d) => d === '1');
}

function buildGrid(key: string): Grid {
  const grid: Grid = [];
  for (let row = 0; row < 128; ++row) {
    grid.push(knotHash(`${key}-${row}`).split('').flatMap(hexToBits));
  }
  return grid;
}

function neighbors(row: number, col: number, size: number) {
  return [
    [row, col - 1],
    [row, col + 1],
    [row - 1, col],
    [row + 1, col],
  ].filter((n) => n.every((v) => v >= 0 && v < size));
}

function countRegions(grid: Grid): number {
  const size = grid.length;
  const regions: Set<string>[] = [];
  for (let row = 0; row < size; ++row) {
    for (let col = 0; col < size; ++col) {
      if (!grid[row][col]) continue;
      let newRegion = []
        .concat([[row, col]], neighbors(row, col, size))
        .filter(([r, c]) => grid[r][c])
        .map((x) => x.join(','));

      const matchingRegions = regions
        .map((region, index) => ({ region, index }))
        .filter((r) => newRegion.some((key) => r.region.has(key)))
        .reverse(); // since we may be removing them by index;

      if (matchingRegions.length === 0) {
        regions.push(new Set(newRegion));
      } else if (matchingRegions.length === 1) {
        const r = matchingRegions[0];
        newRegion.forEach((k) => r.region.add(k));
      } else {
        for (const { region, index } of matchingRegions) {
          regions.splice(index, 1);
          newRegion = newRegion.concat(...region.values());
        }
        regions.push(new Set(newRegion));
      }
    }
  }
  return regions.length;
}

const exampleKey = 'flqrgnkx';
example.equal(buildGrid(exampleKey).flat().filter(Boolean).length, 8108);
example.equal(countRegions(buildGrid(exampleKey)), 1242);

const key = load().raw.trim();
export default solve(
  () => buildGrid(key).flat().filter(Boolean).length,
  () => countRegions(buildGrid(key))
).expect(8304, 1018);
