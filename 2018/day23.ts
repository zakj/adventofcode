import { example, load, solve } from '../advent';

type Point = { x: number; y: number; z: number };
type Bot = Point & { r: number };
type Box = {
  x: [number, number];
  y: [number, number];
  z: [number, number];
};

function parse(lines: string[]): Bot[] {
  return lines.map((line) => {
    const r = Number(line.split('=')[2]);
    const [x, y, z] = line.split(/[<>]/)[1].split(',').map(Number);
    return { x, y, z, r };
  });
}

function distance(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

function countInRangeOfLargest(bots: Bot[]): number {
  const largest = bots.reduce((max, bot) => (bot.r > max.r ? bot : max));
  return bots.filter((b) => distance(largest, b) <= largest.r).length;
}

function inRangeOfBox(box: Box, bot: Bot): boolean {
  let dist = 0;
  if (bot.x < box.x[0]) dist += box.x[0] - bot.x;
  if (bot.x > box.x[1]) dist += bot.x - box.x[1];
  if (bot.y < box.y[0]) dist += box.y[0] - bot.y;
  if (bot.y > box.y[1]) dist += bot.y - box.y[1];
  if (bot.z < box.z[0]) dist += box.z[0] - bot.z;
  if (bot.z > box.z[1]) dist += bot.z - box.z[1];
  return dist <= bot.r;
}

function toPoint(box: Box): Point | null {
  for (const a of ['x', 'y', 'z']) {
    if (box[a][0] !== box[a][1]) return null;
  }
  return { x: box.x[0], y: box.y[0], z: box.z[0] };
}

function splitBox(box: Box): Box[] {
  type Range = [number, number];
  const bounds: Partial<{ x: Range[]; y: Range[]; z: Range[] }> = {};
  for (const d of ['x', 'y', 'z']) {
    const center = Math.floor((box[d][0] + box[d][1]) / 2);
    bounds[d] = [
      [box[d][0], center],
      [center + 1, box[d][1]],
    ].filter(([min, max]) => min <= max);
  }
  return bounds.x.flatMap((x) =>
    bounds.y.flatMap((y) => bounds.z.map((z) => ({ x, y, z })))
  );
}

function inRangeOfMost(bots: Bot[]): Point {
  const maxR = bots.reduce((max, bot) => (bot.r > max.r ? bot : max)).r;
  const bounds: Partial<Box> = {};
  for (const d of ['x', 'y', 'z']) {
    const min = bots.reduce((max, b) => (b[d] < max[d] ? b : max))[d];
    const max = bots.reduce((max, b) => (b[d] > max[d] ? b : max))[d];
    bounds[d] = [min - maxR, max + maxR];
  }
  let boxes = splitBox(bounds as Box);

  while (boxes.length) {
    let boxCounts = boxes.map((box) => ({
      box,
      count: bots.filter((bot) => inRangeOfBox(box, bot)).length,
    }));
    const bestCount = boxCounts.reduce((max, bc) =>
      bc.count > max.count ? bc : max
    ).count;
    boxes = boxCounts
      .filter(({ count }) => count === bestCount)
      .map(({ box }) => box);
    if (boxes.length === 1 && toPoint(boxes[0])) return toPoint(boxes[0]);
    boxes = boxes.flatMap((box) => splitBox(box));
  }
}

const pos = { x: 0, y: 0, z: 0 };
const exampleBots1 = parse(load('ex').paragraphs[0]);
example.equal(countInRangeOfLargest(exampleBots1), 7);
const exampleBots2 = parse(load('ex').paragraphs[1]);
example.equal(distance(pos, inRangeOfMost(exampleBots2)), 36);

const bots = parse(load().lines);
export default solve(
  () => countInRangeOfLargest(bots),
  () => distance(pos, inRangeOfMost(bots))
).expect(713, 104501042);
