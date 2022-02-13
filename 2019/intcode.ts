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

interface Memory {
  get(i: number): number;
  set(i: number, value: number): void;
}

type Input = number[] | string[];
type Output = number[];
type Computer = {
  (...inputs: Input): Output;
  ascii: (...inputs: Input) => string;
  halted: boolean;
  memory: Memory;
};

function makeMemory(init: number[] = []): Memory {
  const arr = init.slice();
  return {
    get(i: number) {
      return arr[i] ?? 0;
    },
    set(i: number, value: number) {
      arr[i] = value;
    },
  };
}

const isStrings = (x: unknown): x is string[] => typeof x?.[0] === 'string';
function deAscii(xs: Input): number[] {
  if (isStrings(xs)) {
    xs = xs
      .concat('')
      .join('\n')
      .split('')
      .map((c) => c.charCodeAt(0));
  }
  return xs;
}

export const parse = (s: string): Program => s.split(',').map(Number);

export function compile(program: Program, ...input: Input): Computer {
  // const memory = new DefaultDict(() => 0, [...program.entries()]);
  const memory = makeMemory(program);
  let relBase = 0;
  let inputs: number[] = deAscii(input);
  let ptr = 0;

  function instructionAt(ptr: number): [OpCode, Param[]] {
    let value = memory.get(ptr);
    const op = value % 100;
    value = Math.floor(value / 100);
    const params: Param[] = [];
    for (let i = 1; i <= arities[op]; ++i) {
      params.push({ mode: value % 10, value: memory.get(ptr + i) });
      value = Math.floor(value / 10);
    }
    return [op, params];
  }

  function get(param: Param): number {
    if (param.mode === ParamMode.Position) return memory.get(param.value);
    if (param.mode === ParamMode.Immediate) return param.value;
    if (param.mode === ParamMode.Relative)
      return memory.get(relBase + param.value);
  }

  function set(param: Param, value: number): void {
    if (param.mode === ParamMode.Immediate) throw new Error();
    if (param.mode === ParamMode.Position) memory.set(param.value, value);
    if (param.mode === ParamMode.Relative)
      memory.set(relBase + param.value, value);
  }

  function run(...xs: Input): Output {
    inputs = inputs.concat(deAscii(xs));
    const outputs: number[] = [];
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
        case OpCode.Input: {
          const input = inputs.shift();
          if (input === undefined) {
            // Rewind pointer and pause.
            ptr -= params.length + 1;
            return outputs;
          }
          set(params[0], input);
          break;
        }
        case OpCode.Output:
          outputs.push(p(0));
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
          return outputs;
        default:
          throw new Error(`unknown opcode ${op}`);
      }
    }
    return outputs;
  }

  run.ascii = function ascii(...xs: Input): string {
    return run(...xs)
      .map((x) => String.fromCharCode(x))
      .join('');
  };

  run.halted = false;
  run.memory = memory;
  return run;
}
