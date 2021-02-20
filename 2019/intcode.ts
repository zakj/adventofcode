export type Program = number[];

enum OpCode {
  Add = 1,
  Multiply = 2,
  Input = 3,
  Output = 4,
  JumpIf = 5,
  JumpElse = 6,
  LessThan = 7,
  Equals = 8,
  IncRelBase = 9,
  Halt = 99,
}

const arities: Record<OpCode, number> = {
  [OpCode.Add]: 3,
  [OpCode.Multiply]: 3,
  [OpCode.Input]: 1,
  [OpCode.Output]: 1,
  [OpCode.JumpIf]: 2,
  [OpCode.JumpElse]: 2,
  [OpCode.LessThan]: 3,
  [OpCode.Equals]: 3,
  [OpCode.IncRelBase]: 1,
  [OpCode.Halt]: 0,
};

enum ParamMode {
  Position = 0,
  Immediate = 1,
  Relative = 2,
}

type Param = {
  mode: ParamMode;
  value: number;
};

type Input = number | Iterator<number>;
type Output = Generator<number, void, void>;
type Computer = {
  (...inputs: Input[]): Output;
  halted: boolean;
  memory: number[];
  seed: (...inputs: Input[]) => Computer;
};

export const parse = (s: string): Program => s.split(',').map(Number);

export function compile(program: Program): Computer {
  const memory = [...program];
  let relBase = 0;
  let inputs: Input[] = [];
  let ptr: number = 0;

  function instructionAt(ptr: number): [OpCode, Param[]] {
    let value = memory[ptr];
    const op = value % 100;
    value = Math.floor(value / 100);
    const params: Param[] = [];
    for (let i = 1; i <= arities[op]; ++i) {
      params.push({ mode: value % 10, value: memory[ptr + i] });
      value = Math.floor(value / 10);
    }
    return [op, params];
  }

  function get(param: Param): number {
    if (param.mode === ParamMode.Position) return memory[param.value];
    if (param.mode === ParamMode.Immediate) return param.value;
    if (param.mode === ParamMode.Relative) return memory[relBase + param.value];
  }

  function set(param: Param, value: number): void {
    if (param.mode === ParamMode.Immediate) throw new Error();
    if (param.mode === ParamMode.Position) memory[param.value] = value;
    if (param.mode === ParamMode.Relative)
      memory[relBase + param.value] = value;
  }

  function* run(...xs: typeof inputs): Output {
    seed(...xs);
    while (!run.halted) {
      const [op, params] = instructionAt(ptr);
      const p = (n: number) => get(params[n]);
      ptr += params.length + 1;

      switch (op) {
        case OpCode.Add:
          set(params[2], p(0) + p(1));
          break;
        case OpCode.Multiply:
          set(params[2], p(0) * p(1));
          break;
        case OpCode.Input:
          const input = inputs.shift();
          if (input === undefined) {
            // Rewind pointer and pause.
            ptr -= params.length + 1;
            return;
          }
          set(
            params[0],
            typeof input === 'number' ? input : input.next().value
          );
          break;
        case OpCode.Output:
          yield p(0);
          break;
        case OpCode.JumpIf:
          if (p(0) !== 0) ptr = p(1);
          break;
        case OpCode.JumpElse:
          if (p(0) === 0) ptr = p(1);
          break;
        case OpCode.LessThan:
          set(params[2], p(0) < p(1) ? 1 : 0);
          break;
        case OpCode.Equals:
          set(params[2], p(0) === p(1) ? 1 : 0);
          break;
        case OpCode.IncRelBase:
          relBase += p(0);
          break;
        case OpCode.Halt:
          run.halted = true;
          return;
        default:
          throw new Error(`unknown opcode ${op}`);
      }
    }
  }

  function seed(...xs: typeof inputs): Computer {
    inputs = inputs.concat(xs);
    return run;
  }

  run.halted = false;
  run.memory = memory;
  run.seed = seed;
  return run;
}
