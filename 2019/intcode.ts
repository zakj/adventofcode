export type Program = number[];

enum OperationType {
  Add = 1,
  Multiply = 2,
  Input = 3,
  Output = 4,
  JumpIf = 5,
  JumpElse = 6,
  LessThan = 7,
  Equals = 8,
  AdjustRelativeBase = 9,
  Exit = 99,
}

interface Operation {
  paramCount: number;
}

enum ParamMode {
  Position = 0,
  Immediate = 1,
  Relative = 2,
}

const OPERATIONS: { [key in OperationType]: Operation } = {
  [OperationType.Add]: { paramCount: 3 },
  [OperationType.Multiply]: { paramCount: 3 },
  [OperationType.Input]: { paramCount: 1 },
  [OperationType.Output]: { paramCount: 1 },
  [OperationType.JumpIf]: { paramCount: 2 },
  [OperationType.JumpElse]: { paramCount: 2 },
  [OperationType.LessThan]: { paramCount: 3 },
  [OperationType.Equals]: { paramCount: 3 },
  [OperationType.AdjustRelativeBase]: { paramCount: 1 },
  [OperationType.Exit]: { paramCount: 0 },
};

class ParamManager {
  private modes: ParamMode[];

  constructor(
    private readonly memory: Program,
    private readonly relativeBase: number,
    modes: number,
    private readonly values: number[]
  ) {
    this.modes = modes
      .toString()
      .split('')
      .map(t => Number(t))
      .reverse();
    while (this.modes.length < values.length)
      this.modes.push(ParamMode.Position);
  }

  private extendMemory(length: number): void {
    const previousLength = this.memory.length;
    this.memory.length = length;
    this.memory.fill(0, previousLength);
  }

  private index(mode: ParamMode, value: number): number {
    if (![ParamMode.Position, ParamMode.Relative].includes(mode)) {
      throw new Error(`unexpected parameter mode ${mode}`);
    }
    const index = value + (mode === ParamMode.Relative ? this.relativeBase : 0);
    if (index < 0) throw new Error('negative memory index');
    if (index > this.memory.length) this.extendMemory(index + 1);
    return index;
  }

  get(i: number): number {
    const mode = this.modes[i];
    const value = this.values[i];
    if (mode === ParamMode.Immediate) return value;
    return this.memory[this.index(mode, value)];
  }

  set(i: number, value: number): void {
    this.memory[this.index(this.modes[i], this.values[i])] = value;
  }
}

export default function* intcode(
  instructions: Program,
  inputs: number[] = []
): Generator<number | undefined, void, number | undefined> {
  const memory = instructions.slice();
  let relativeBase = 0;
  let ptr = 0;
  while (ptr < memory.length) {
    const opcode: OperationType = memory[ptr] % 100;
    const paramModes: number = Math.floor(memory[ptr] / 100);
    const op = OPERATIONS[opcode];
    if (!op) throw new Error(`unknown opcode ${opcode} at index ${ptr}`);
    ptr++;
    const params = new ParamManager(
      memory,
      relativeBase,
      paramModes,
      memory.slice(ptr, ptr + op.paramCount)
    );
    ptr += op.paramCount;

    if (opcode === OperationType.Add) {
      params.set(2, params.get(0) + params.get(1));
    } else if (opcode === OperationType.Multiply) {
      params.set(2, params.get(0) * params.get(1));
    } else if (opcode === OperationType.Input) {
      let input;
      if (inputs.length) input = inputs.shift();
      else input = yield;
      params.set(0, input!);
    } else if (opcode === OperationType.Output) {
      yield params.get(0);
    } else if (opcode === OperationType.JumpIf) {
      if (params.get(0) !== 0) ptr = params.get(1);
    } else if (opcode === OperationType.JumpElse) {
      if (params.get(0) === 0) ptr = params.get(1);
    } else if (opcode === OperationType.LessThan) {
      params.set(2, params.get(0) < params.get(1) ? 1 : 0);
    } else if (opcode === OperationType.Equals) {
      params.set(2, params.get(0) === params.get(1) ? 1 : 0);
    } else if (opcode === OperationType.AdjustRelativeBase) {
      relativeBase += params.get(0);
    } else if (opcode === OperationType.Exit) return;
  }

  throw new Error('end of program without exit code');
}
