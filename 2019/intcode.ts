enum OperationType {
  Add = 1,
  Multiply,
  Input,
  Output,
  JumpIf,
  JumpElse,
  LessThan,
  Equals,
  Exit = 99,
}

interface Operation {
  paramCount: number;
}

enum ParameterMode {
  Position = 0,
  Immediate = 1,
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
  [OperationType.Exit]: { paramCount: 0 },
};

export type Program = number[];

export default function intcode(
  instructions: Program,
  inputs: number[] = []
): number[] {
  const memory = instructions.slice();
  let ptr = 0;
  const outputs: number[] = [];
  while (ptr < memory.length) {
    const opcode: OperationType = memory[ptr] % 100;
    const paramModes: ParameterMode[] = Math.floor(memory[ptr] / 100)
      .toString()
      .split('')
      .map(t => Number(t))
      .reverse();
    ptr++;

    const op = OPERATIONS[opcode];
    if (!op) throw new Error(`unknown opcode ${opcode} at index ${ptr}`);

    const params = memory.slice(ptr, ptr + op.paramCount);
    while (paramModes.length < op.paramCount)
      paramModes.push(ParameterMode.Position);
    ptr += op.paramCount;

    const resolveParam = (i: number) =>
      paramModes[i] === ParameterMode.Position ? memory[params[i]] : params[i];

    if (opcode === OperationType.Add) {
      memory[params[2]] = resolveParam(0) + resolveParam(1);
    } else if (opcode === OperationType.Multiply) {
      memory[params[2]] = resolveParam(0) * resolveParam(1);
    } else if (opcode === OperationType.Input) {
      if (!inputs.length)
        throw new Error(`insufficient inputs at index ${ptr}`);
      memory[params[0]] = inputs.shift() as number; // TODO assert array length isn't enough?
    } else if (opcode === OperationType.Output) {
      outputs.push(resolveParam(0));
    } else if (opcode === OperationType.JumpIf) {
      if (resolveParam(0) !== 0) ptr = resolveParam(1);
    } else if (opcode === OperationType.JumpElse) {
      if (resolveParam(0) === 0) ptr = resolveParam(1);
    } else if (opcode === OperationType.LessThan) {
      memory[params[2]] = resolveParam(0) < resolveParam(1) ? 1 : 0;
    } else if (opcode === OperationType.Equals) {
      memory[params[2]] = resolveParam(0) === resolveParam(1) ? 1 : 0;
    } else if (opcode === OperationType.Exit) break;
  }

  return outputs;
}
