import { load, solve } from '../advent';
import { cartesianProduct, pairs, sum } from '../util';

type Instruction = {
  on: boolean;
  rect: Rect3d;
};

function parse(lines: string[]): Instruction[] {
  return lines.map((line) => {
    const match = line.match(
      /(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/
    );
    const values = match.slice(2, 8).map(Number);
    return {
      on: match[1] === 'on',
      rect: {
        min: { x: values[0], y: values[2], z: values[4] },
        max: { x: values[1], y: values[3], z: values[5] },
      },
    };
  });
}

// TODO: factor all this Rect3d stuff into coords and clean up API
type Point3d = {
  x: number;
  y: number;
  z: number;
};
type Rect3d = {
  min: Point3d;
  max: Point3d;
};

function rect3dVolume(rect: Rect3d): number {
  return (
    (Math.abs(rect.max.x - rect.min.x) + 1) *
    (Math.abs(rect.max.y - rect.min.y) + 1) *
    (Math.abs(rect.max.z - rect.min.z) + 1)
  );
}

function rect3dIntersect(a: Rect3d, b: Rect3d): Rect3d | null {
  const min = {
    x: Math.max(a.min.x, b.min.x),
    y: Math.max(a.min.y, b.min.y),
    z: Math.max(a.min.z, b.min.z),
  };
  const max = {
    x: Math.min(a.max.x, b.max.x),
    y: Math.min(a.max.y, b.max.y),
    z: Math.min(a.max.z, b.max.z),
  };
  if (min.x <= max.x && min.y <= max.y && min.z <= max.z) return { min, max };
  return null;
}

function rect3dEqual(self: Rect3d, other: Rect3d): boolean {
  return ['x', 'y', 'z'].every(
    (axis) =>
      self.min[axis] === other.min[axis] && self.max[axis] === other.max[axis]
  );
}

function rect3dDifference(rect: Rect3d, other: Rect3d): Rect3d[] {
  const intersection = rect3dIntersect(rect, other);
  if (!intersection) return [rect];
  const xs = new Set([
    rect.min.x,
    rect.max.x + 1,
    intersection.min.x,
    intersection.max.x + 1,
  ]);
  const ys = new Set([
    rect.min.y,
    rect.max.y + 1,
    intersection.min.y,
    intersection.max.y + 1,
  ]);
  const zs = new Set([
    rect.min.z,
    rect.max.z + 1,
    intersection.min.z,
    intersection.max.z + 1,
  ]);
  return cartesianProduct(
    pairs([...xs].sort((a, b) => a - b)),
    pairs([...ys].sort((a, b) => a - b)),
    pairs([...zs].sort((a, b) => a - b))
  )
    .map(([x, y, z]) => ({
      min: { x: x[0], y: y[0], z: z[0] },
      max: { x: x[1] - 1, y: y[1] - 1, z: z[1] - 1 },
    }))
    .filter((rect) => !rect3dEqual(rect, intersection));
}

function countOn(instructions: Instruction[]): number {
  let onCuboids: Rect3d[] = [];
  for (const instr of instructions) {
    onCuboids = onCuboids.flatMap((rect) =>
      rect3dIntersect(rect, instr.rect)
        ? rect3dDifference(rect, instr.rect)
        : rect
    );
    if (instr.on) onCuboids.push(instr.rect);
  }
  return sum(onCuboids.map(rect3dVolume));
}

function initArea(instructions: Instruction[]): Instruction[] {
  const validArea = {
    min: { x: -50, y: -50, z: -50 },
    max: { x: 50, y: 50, z: 50 },
  };
  return instructions.filter((instr) => rect3dIntersect(validArea, instr.rect));
}

const instructions = parse(load().lines);
export default solve(
  () => countOn(initArea(instructions)),
  () => countOn(instructions)
).expect(543306, 1285501151402480);
