import { answers, example, load } from '../advent';

type Instruction = {
  action: string;
  value: number;
};

type Point = {
  x: number;
  y: number;
};

function parseInstructions(lines: string[]): Instruction[] {
  return lines.map((line) => ({
    action: line[0],
    value: Number(line.slice(1)),
  }));
}

function executePartOne(instructions: Instruction[]): Point {
  const pos: Point = { x: 0, y: 0 };
  const headingDirection = {
    0: { x: 1, y: 0 },
    90: { x: 0, y: 1 },
    180: { x: -1, y: 0 },
    270: { x: 0, y: -1 },
  };
  let heading = 0;
  instructions.forEach((instr) => {
    switch (instr.action) {
      case 'N':
        pos.y -= instr.value;
        break;
      case 'S':
        pos.y += instr.value;
        break;
      case 'E':
        pos.x += instr.value;
        break;
      case 'W':
        pos.x -= instr.value;
        break;
      case 'L':
        heading -= instr.value;
        if (heading < 0) heading = 360 + heading;
        break;
      case 'R':
        heading = Math.abs(heading + instr.value) % 360;
        break;
      case 'F':
        const direction = headingDirection[heading];
        pos.x += instr.value * direction.x;
        pos.y += instr.value * direction.y;
        break;
    }
  });
  return pos;
}

function executePartTwo(instructions: Instruction[]): Point {
  const pos: Point = { x: 0, y: 0 };
  const waypointDelta = { x: 10, y: 1 };
  instructions.forEach((instr) => {
    switch (instr.action) {
      case 'N':
        waypointDelta.y += instr.value;
        break;
      case 'S':
        waypointDelta.y -= instr.value;
        break;
      case 'E':
        waypointDelta.x += instr.value;
        break;
      case 'W':
        waypointDelta.x -= instr.value;
        break;
      case 'L':
        switch (instr.value) {
          case 90:
            [waypointDelta.x, waypointDelta.y] = [
              -waypointDelta.y,
              waypointDelta.x,
            ];
            break;
          case 180:
            [waypointDelta.x, waypointDelta.y] = [
              -waypointDelta.x,
              -waypointDelta.y,
            ];
            break;
          case 270:
            [waypointDelta.x, waypointDelta.y] = [
              waypointDelta.y,
              -waypointDelta.x,
            ];
            break;
        }
        break;
      case 'R':
        switch (instr.value) {
          case 90:
            [waypointDelta.x, waypointDelta.y] = [
              waypointDelta.y,
              -waypointDelta.x,
            ];
            break;
          case 180:
            [waypointDelta.x, waypointDelta.y] = [
              -waypointDelta.x,
              -waypointDelta.y,
            ];
            break;
          case 270:
            [waypointDelta.x, waypointDelta.y] = [
              -waypointDelta.y,
              waypointDelta.x,
            ];
            break;
        }
        break;
      case 'F':
        pos.x += waypointDelta.x * instr.value;
        pos.y += waypointDelta.y * instr.value;
        break;
    }
  });
  return pos;
}

function manhattanDistance(point: Point): number {
  return Math.abs(point.x) + Math.abs(point.y);
}

const exampleInstructions = parseInstructions(load(12, 'ex').lines);
const exampleOneEnd = executePartOne(exampleInstructions);
example.equal(25, manhattanDistance(executePartOne(exampleInstructions)));
example.equal(286, manhattanDistance(executePartTwo(exampleInstructions)));

const instructions = parseInstructions(load(12).lines);
answers(
  () => manhattanDistance(executePartOne(instructions)),
  () => manhattanDistance(executePartTwo(instructions))
);
