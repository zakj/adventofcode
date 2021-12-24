import { answers, example, load } from '../advent';
import { Point3d, Rect } from '../coords';
import { cartesianProduct, pairs, sum } from '../util';

type Instruction = {
  on: boolean;
  x: [number, number];
  y: [number, number];
  z: [number, number];
};

function parse(lines: string[]): Instruction[] {
  return lines.map((line) => {
    const match = line.match(
      /(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/
    );
    return {
      on: match[1] === 'on',
      x: [match[2], match[3]].map(Number) as [number, number],
      y: [match[4], match[5]].map(Number) as [number, number],
      z: [match[6], match[7]].map(Number) as [number, number],
    };
  });
}

function cubesInit(instructions: Instruction[]): number {
  const cubes = new Set();
  const init = instructions.map((instr) => ({
    on: instr.on,
    x: [Math.max(-50, instr.x[0]), Math.min(50, instr.x[1])],
    y: [Math.max(-50, instr.y[0]), Math.min(50, instr.y[1])],
    z: [Math.max(-50, instr.z[0]), Math.min(50, instr.z[1])],
  }));
  for (const instr of init) {
    for (let x = instr.x[0]; x <= instr.x[1]; ++x) {
      for (let y = instr.y[0]; y <= instr.y[1]; ++y) {
        for (let z = instr.z[0]; z <= instr.z[1]; ++z) {
          if (instr.on) cubes.add([x, y, z].join(','));
          else cubes.delete([x, y, z].join(','));
        }
      }
    }
  }
  return cubes.size;
}

function volume(a: Point3d, b: Point3d): number {
  return (
    (Math.abs(a.x - b.x) + 1) *
    (Math.abs(a.y - b.y) + 1) *
    (Math.abs(a.z - b.z) + 1)
  );
}

function volumeHelper(instr: Instruction) {
  return volume(
    { x: instr.x[0], y: instr.y[0], z: instr.z[0] },
    { x: instr.x[1], y: instr.y[1], z: instr.z[1] }
  );
}

function rect3dVolume(rect: Rect3d): number {
  return (
    (Math.abs(rect.max.x - rect.min.x) + 1) *
    (Math.abs(rect.max.y - rect.min.y) + 1) *
    (Math.abs(rect.max.z - rect.min.z) + 1)
  );
}

type Rect3d = {
  min: Point3d;
  max: Point3d;
};

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

function rectIntersect(a: Rect, b: Rect): Rect | null {
  const min = {
    x: Math.max(a.min.x, b.min.x),
    y: Math.max(a.min.y, b.min.y),
  };
  const max = {
    x: Math.min(a.max.x, b.max.x),
    y: Math.min(a.max.y, b.max.y),
  };
  if (min.x <= max.x && min.y <= max.y) return { min, max };
  return null;
}

function rectEqual(self: Rect, other: Rect): boolean {
  return ['x', 'y'].every(
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
  // console.log({ xs, ys, zs });
  // console.log('PRODUCT');
  // const product = cartesianProduct(
  //   pairs([...xs].sort((a, b) => a - b)),
  //   pairs([...ys].sort((a, b) => a - b)),
  //   pairs([...zs].sort((a, b) => a - b))
  // );
  // for (const pair of product) {
  //   console.log(pair);
  // }
  // console.log('---');
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

function rectDifference(rect: Rect, other: Rect): Rect[] {
  const intersection = rectIntersect(rect, other);
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
  return cartesianProduct(
    pairs([...xs].sort((a, b) => a - b)),
    pairs([...ys].sort((a, b) => a - b))
  )
    .map(([x, y]) => ({
      min: { x: x[0], y: y[0] },
      max: { x: x[1] - 1, y: y[1] - 1 },
    }))
    .filter((rect) => !rectEqual(rect, intersection));
}

function rectToString(rect: Rect): string {
  return `[${rect.min.x},${rect.min.y} -> ${rect.max.x},${rect.max.y}]`;
}

function rect3dToString(rect: Rect3d): string {
  return `[${rect.min.x},${rect.min.y},${rect.min.z} -> ${rect.max.x},${rect.max.y},${rect.max.z}]`;
}

example.deepEqual(
  rectDifference(
    { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } },
    { min: { x: 1, y: 1 }, max: { x: 3, y: 3 } }
  ),
  [
    { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
    { min: { x: 0, y: 1 }, max: { x: 0, y: 2 } },
    { min: { x: 1, y: 0 }, max: { x: 2, y: 0 } },
  ]
);

example.deepEqual(
  rectDifference(
    { min: { x: 0, y: 0 }, max: { x: 1, y: 2 } },
    { min: { x: 1, y: 1 }, max: { x: 2, y: 1 } }
  ),
  [
    { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
    { min: { x: 0, y: 1 }, max: { x: 0, y: 1 } },
    { min: { x: 0, y: 2 }, max: { x: 0, y: 2 } },
    { min: { x: 1, y: 0 }, max: { x: 1, y: 0 } },
    { min: { x: 1, y: 2 }, max: { x: 1, y: 2 } },
  ]
);

example.deepEqual(
  rectDifference(
    { min: { x: 0, y: 0 }, max: { x: 3, y: 3 } },
    { min: { x: 1, y: 1 }, max: { x: 2, y: 2 } }
  ),
  [
    { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } },
    { min: { x: 0, y: 1 }, max: { x: 0, y: 2 } },
    { min: { x: 0, y: 3 }, max: { x: 0, y: 3 } },
    { min: { x: 1, y: 0 }, max: { x: 2, y: 0 } },
    { min: { x: 1, y: 3 }, max: { x: 2, y: 3 } },
    { min: { x: 3, y: 0 }, max: { x: 3, y: 0 } },
    { min: { x: 3, y: 1 }, max: { x: 3, y: 2 } },
    { min: { x: 3, y: 3 }, max: { x: 3, y: 3 } },
  ]
);

example.deepEqual(
  rectDifference(
    { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } },
    { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } }
  ),
  []
);

function cubes(instructions: Instruction[]): number {
  let boxes: Rect3d[] = [];

  type Instruction2 = {
    on: boolean;
    rect: Rect3d;
  };

  const clamp = (min: number, v: number, max: number): number =>
    Math.min(Math.max(v, min), max);

  const init = instructions.map((instr) => ({
    on: instr.on,
    x: [clamp(-50, instr.x[0], 50), clamp(-50, instr.x[1], 50)],
    y: [clamp(-50, instr.y[0], 50), clamp(-50, instr.y[1], 50)],
    z: [clamp(-50, instr.z[0], 50), clamp(-50, instr.z[1], 50)],
  }));

  const rectInstructions: Instruction2[] = instructions.map((instr) => ({
    on: instr.on,
    rect: {
      min: { x: instr.x[0], y: instr.y[0], z: instr.z[0] },
      max: { x: instr.x[1], y: instr.y[1], z: instr.z[1] },
    },
  }));

  for (const instr of rectInstructions) {
    // console.log('INSTR', instr.rect.min, instr.rect.max);
    boxes = boxes.flatMap((rect) =>
      rect3dIntersect(rect, instr.rect)
        ? rect3dDifference(rect, instr.rect)
        : rect
    );
    if (instr.on) boxes.push(instr.rect);
  }
  console.log(
    boxes.map((b) => `${rect3dToString(b)}: ${rect3dVolume(b)}`).join('\n')
  );
  console.log('...');
  return sum(boxes.map(rect3dVolume));

  // const newBoxes: Rect3d[] = [];
  // if (instr.on) newBoxes.push(instr.rect);
  // for (let i = 0; i < boxes.length; ++i) {
  //   if (rect3dIntersect(boxes[i], instr.rect)) {
  //     newBoxes.push(...rect3dDifference(boxes[i], instr.rect));
  //   } else {
  //     newBoxes.push(boxes[i]);
  //   }
  // }
  // boxes = newBoxes;

  // if (instr.on) {
  //       // console.log('start volume', rect3dVolume(boxes[i]));
  //       // console.log('end volume', [
  //       //   ...rect3dDifference(boxes[i], instr.rect).map(rect3dVolume),
  //       //   rect3dVolume(rect3dIntersect(boxes[i], instr.rect)),
  //       // ]);
  //       // boxes.splice(i, 1);
  //   }
  //   newBoxes.push(instr.rect);
  // } else {
  //   // find all boxes that intersect. remove each one from boxes, run splitCube, and reinsert
  //   for (let i = 0; i < boxes.length; ++i) {
  //     if (rect3dIntersect(boxes[i], instr.rect)) {
  //       // console.log('start volume', rect3dVolume(boxes[i]));
  //       // console.log('end volume', [
  //       //   ...rect3dDifference(boxes[i], instr.rect).map(rect3dVolume),
  //       //   rect3dVolume(rect3dIntersect(boxes[i], instr.rect)),
  //       // ]);
  //       // boxes.splice(i, 1);
  //       newBoxes.push(...rect3dDifference(boxes[i], instr.rect));
  //     } else {
  //       newBoxes.push(boxes[i]);
  //     }
  //   }
  // }
  // console.log({ newBoxes });
  // console.log(
  //   'handled',
  //   instr.on ? 'on' : 'off',
  //   sum(boxes.map(rect3dVolume))
  // );
  // console.log(
  //   boxes.map((b) => `${rect3dToString(b)}: ${rect3dVolume(b)}`).join('\n')
  // );
  // console.log('...');
  // }
  // console.log(init.length, boxes.length);
  // console.log(boxes.map(rect3dToString).join('\n'));
}

const exampleData = parse([
  `on x=10..12,y=10..12,z=10..12`,
  `on x=11..13,y=11..13,z=11..13`,
  `off x=9..11,y=9..11,z=9..11`,
  `on x=10..10,y=10..10,z=10..10`,
]);
console.log('EXAMPLE 1');
example.equal(cubesInit(exampleData), 39);
console.log('EXAMPLE 2');
example.equal(cubes(exampleData), 39);
console.log('EXAMPLE DONE');

const onBox = { min: { x: 10, y: 10, z: 11 }, max: { x: 10, y: 10, z: 12 } };
const offBox = { min: { x: 9, y: 9, z: 9 }, max: { x: 11, y: 11, z: 11 } };

console.log('*****');
console.log(rect3dDifference(onBox, offBox));

const example2Data = parse(
  `on x=-20..26,y=-36..17,z=-47..7
  on x=-20..33,y=-21..23,z=-26..28
  on x=-22..28,y=-29..23,z=-38..16
  on x=-46..7,y=-6..46,z=-50..-1
  on x=-49..1,y=-3..46,z=-24..28
  on x=2..47,y=-22..22,z=-23..27
  on x=-27..23,y=-28..26,z=-21..29
  on x=-39..5,y=-6..47,z=-3..44
  on x=-30..21,y=-8..43,z=-13..34
  on x=-22..26,y=-27..20,z=-29..19
  off x=-48..-32,y=26..41,z=-47..-37
  on x=-12..35,y=6..50,z=-50..-2
  off x=-48..-32,y=-32..-16,z=-15..-5
  on x=-18..26,y=-33..15,z=-7..46
  off x=-40..-22,y=-38..-28,z=23..41
  on x=-16..35,y=-41..10,z=-47..6
  off x=-32..-23,y=11..30,z=-14..3
  on x=-49..-5,y=-3..45,z=-29..18
  off x=18..30,y=-20..-8,z=-3..13
  on x=-41..9,y=-7..43,z=-33..15
  on x=-54112..-39298,y=-85059..-49293,z=-27449..7877
  on x=967..23432,y=45373..81175,z=27513..53682`.split('\n')
);
example.equal(cubes(example2Data), 590784);

const data = parse(load(22).lines);
answers.expect(543306, 1285501151402480);
answers(
  () => cubesInit(data),
  // 976453310652387 not right
  () => cubes(data)
);

// const xs = new Set([self.min.x, self.max.x + 1]);
// const ys = new Set([self.min.y, self.max.y + 1]);
// if (self.min.x < other.min.x && other.min.x < self.max.x) xs.add(other.min.x);
// if (self.min.x < other.max.x && other.max.x < self.max.x) xs.add(other.max.x);
// if (self.min.y < other.min.y && other.min.y < self.max.y) ys.add(other.min.y);
// if (self.min.y < other.max.y && other.max.y < self.max.y) ys.add(other.max.y);
// console.log('---');
// console.log(cartesianProduct(pairs([0, 1, 3]), pairs([0, 1, 3])));
// console.log(
//   cartesianProduct(pairs([0, 1, 3]), pairs([0, 1, 3])).map(([x, y]) => ({
//     min: { x: x[0], y: y[0] },
//     max: { x: x[1] - 1, y: y[1] - 1 },
//   }))
// );
// console.log('---');
// console.log(products[0], products[1]);

// function findDottedLines(rect: Rect, other: Rect) {
//   const intersection = rectIntersect(rect, other);
//   const xs = new Set([
//     rect.min.x,
//     rect.max.x,
//     intersection.min.x,
//     intersection.max.x,
//   ]);

//   console.log({ intersection });
//   console.log('DOTTED', { xs: [...xs].sort((a, b) => a - b) });
// }

// findDottedLines(
//   { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } },
//   { min: { x: 1, y: 1 }, max: { x: 3, y: 3 } }
// );
// findDottedLines(
//   { min: { x: 1, y: 0 }, max: { x: 2, y: 2 } },
//   { min: { x: 0, y: 1 }, max: { x: 1, y: 1 } }
// );
//
// function rect3dDifference(self: Rect3d, other: Rect3d): Rect3d[] {
//   const intersection = rect3dIntersect(self, other);
//   if (!intersection) return [self];
//   console.log({ intersection });
//   const xs = new Set([self.min.x, self.max.x]);
//   const ys = new Set([self.min.y, self.max.y]);
//   const zs = new Set([self.min.z, self.max.z]);
//   if (self.min.x < other.min.x && other.min.x < self.max.x) xs.add(other.min.x);
//   if (self.min.x < other.max.x && other.max.x < self.max.x) xs.add(other.max.x);
//   if (self.min.y < other.min.y && other.min.y < self.max.y) xs.add(other.min.y);
//   if (self.min.y < other.max.y && other.max.y < self.max.y) xs.add(other.max.y);
//   if (self.min.z < other.min.z && other.min.z < self.max.z) xs.add(other.min.z);
//   if (self.min.z < other.max.z && other.max.z < self.max.z) xs.add(other.max.z);
//   const products = cartesianProduct(
//     pairs([...xs].sort((a, b) => a - b)),
//     pairs([...ys].sort((a, b) => a - b)),
//     pairs([...zs].sort((a, b) => a - b))
//   );
//   return products
//     .map(([x, y, z]) => ({
//       min: { x: x[0], y: y[0], z: z[0] },
//       max: { x: x[1], y: y[1], z: z[1] },
//     }))
//     .filter((rect) => !rect3dEqual(rect, intersection));
// }
