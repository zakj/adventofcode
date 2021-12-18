import { answers, load } from '../advent';
import { chunks, sum, zip } from '../util';

function parse(lines: string[]): number[][] {
  return lines.map((line) => line.trim().split(/\s+/).map(Number));
}

function isValidTriangle(sides: number[]): boolean {
  return sides.every((s, i) => s < sum(sides.filter((_, j) => i !== j)));
}

function fromColumns(lines: number[][]): number[][] {
  return chunks(zip(...lines).flat(), 3);
}

const triangles = parse(load(3).lines);
answers.expect(983, 1836);
answers(
  () => triangles.filter(isValidTriangle).length,
  () => fromColumns(triangles).filter(isValidTriangle).length
);
