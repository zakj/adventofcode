import { answers, load } from '../advent';
import { chunks, last, ValuesOf } from '../util';

const InstructionType = {
  Inp: 'inp',
  Add: 'add',
  Mul: 'mul',
  Div: 'div',
  Mod: 'mod',
  Eql: 'eql',
} as const;
type InstructionType = ValuesOf<typeof InstructionType>;

type Variable = 'w' | 'x' | 'y' | 'z';

type Instruction = {
  type: InstructionType;
  a: Variable;
  b?: Variable | number;
};

type Program = Instruction[];

function parse(lines: string[]): Program {
  return lines.map((line) => {
    const [type, a, b] = line.split(' ');
    return {
      type: type as InstructionType,
      a: a as Variable,
      b: isNaN(Number(b)) ? (b as Variable) : Number(b),
    };
  });
}

function run(program: Program, input: number): Record<Variable, number> {
  const inputs = input.toString().split('').map(Number);
  const variables: Record<Variable, number> = {
    w: 0,
    x: 0,
    y: 0,
    z: 0,
  };

  function value(x: Variable | number): number {
    if (typeof x === 'number') return x;
    return variables[x];
  }

  let passed = -1;

  for (const instr of program) {
    switch (instr.type) {
      case InstructionType.Inp:
        console.log('input with zval', value('z'));
        if (value('z') === 0) {
          ++passed;
          console.log('z', passed);
        } else {
          console.log(passed);
          return variables;
        }
        variables[instr.a] = inputs.shift();
        break;
      case InstructionType.Add:
        variables[instr.a] += value(instr.b);
        break;
      case InstructionType.Mul:
        variables[instr.a] *= value(instr.b);
        break;
      case InstructionType.Div:
        if (value(instr.b) === 0) throw 'divide by zero';
        variables[instr.a] = Math.floor(variables[instr.a] / value(instr.b));
        break;
      case InstructionType.Mod:
        if (value(instr.a) < 0 || value(instr.b) <= 0) throw 'invalid mod';
        variables[instr.a] %= value(instr.b);
        break;
      case InstructionType.Eql:
        variables[instr.a] = value(instr.a) === value(instr.b) ? 1 : 0;
        break;
    }
  }

  return variables;
}

function decompiled(input: number): boolean {
  const digits = input.toString().split('').map(Number);
  if (digits.some((d) => d === 0)) return false;

  const divs = [1, 1, 1, 1, 26, 1, 26, 1, 26, 26, 1, 26, 26, 26];
  const xAdds = [14, 11, 12, 11, -10, 15, -14, 10, -4, -3, 13, -3, -9, -12];
  const yAdds = [16, 3, 2, 7, 13, 6, 10, 11, 6, 5, 11, 4, 4, 6];

  let z = 0;
  for (let i = 0; i < digits.length; ++i) {
    const input = digits[i];
    let x = (z % 26) + xAdds[i]; // paired push + xadds should equal input
    z /= divs[i]; // maybe pop
    if (x !== input) z = z * 26 + input + yAdds[i];
  }
  return z === 0;
  // (16 + previnput) - 12 == input
  // 1: 17 - 12 = 5
  // 2: 18 - 12 = 6
  // 3: 19 - 12 = 7
  // 4: 20 - 12 = 8
  // 5: 21 - 12 = 9
}

const program = parse(load(24).lines);
answers.expect(59996912981939, 17241911811915);
answers(
  () => {
    type Dec = ['push' | 'popIf', number];
    const decompiled: Dec[] = chunks(program, program.length / 14).map((c) =>
      // if z /= 1, we can't pass the check, so we push to z.
      // otherwise (z /= 26, which pops), we can pass the check and skip the push
      c[4].b === 1 ? (['push', c[15].b] as Dec) : (['popIf', c[5].b] as Dec)
    );
    const pairs: [number, number][] = [];
    const stack: number[] = [];
    for (let i = 0; i < decompiled.length; ++i) {
      if (decompiled[i][0] === 'push') stack.push(i);
      else pairs.push([stack.pop(), i]);
    }

    const possibleInputs = [];
    for (const [a, b] of pairs) {
      possibleInputs[a] = [];
      possibleInputs[b] = [];
      for (let i = 1; i <= 9; ++i) {
        for (let j = 1; j <= 9; ++j) {
          if (decompiled[a][1] + i + decompiled[b][1] !== j) continue;
          possibleInputs[a].push(i);
          possibleInputs[b].push(j);
        }
      }
      // decompiled[a][1] + <input at a> + decompiled[b][1] === <input at b>
    }
    console.log(possibleInputs);

    const highest = new Array(14);
    for (const [a, b] of pairs) {
      highest[a] = last(possibleInputs[a]);
      highest[b] = last(possibleInputs[b]);
    }
    console.log(Number(highest.join('')));

    const lowest = new Array(14);
    for (const [a, b] of pairs) {
      lowest[a] = possibleInputs[a][0];
      lowest[b] = possibleInputs[b][0];
    }
    console.log(lowest);
    return Number(lowest.join(''));

    // let cur = 99999999999999;
    // while (true) {
    //   if (decompiled(cur)) return cur;
    //   --cur;
    // }

    // run(program, cur);

    // while (true) {
    //   if (!cur.toString().split('').includes('0')) {
    //     const vars = run(program, cur);
    //     if (vars.z === 0) return cur;
    //   }
    //   --cur;
    // }
  },
  () => {}
);

/*

w x y z
0 0 0 0

 inp w
 mul x 0
 add x z
 mod x 26
 div z 1
 add x 14
   x = z % 26 + 14   | x === 14
 eql x w
   x = x === w  (impossible!)
 eql x 0
   x = x === 0   x === 1
 mul y 0
   y = 0
 add y 25
   y = 25
 mul y x
   y *= x   (y == 25 | 0)
 add y 1
   y++   (y == 26 | 0)
 mul z y
   z *= y  (0)
 
 mul y 0
 add y w
 add y 16
 mul y x
   y = (w + 16) * x
 add z y
   z += y


inp w
mul x 0
add x z
mod x 26
div z 1
x = z % 26 + 11




inp w		inp w		inp w		inp w		inp w		inp w		inp w		inp w		inp w		inp w		inp w		inp w		inp w		inp w
mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0		mul x 0
add x z		add x z		add x z		add x z		add x z		add x z		add x z		add x z		add x z		add x z		add x z		add x z		add x z		add x z
mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26	mod x 26
x = z % 26

div z 1		div z 1		div z 1		div z 1		div z 26	div z 1		div z 26	div z 1		div z 26	div z 26	div z 1		div z 26	div z 26	div z 26

for some characters, divide z by 26
x add is always negative when div z is 26


add x 14	add x 11	add x 12	add x 11	add x -10	add x 15	add x -14	add x 10	add x -4	add x -3	add x 13	add x -3	add x -9	add x -12
***


  eql x w		eql x w		eql x w		eql x w		eql x w		eql x w		eql x w		eql x w		eql x w		eql x w		eql x w		eql x w		eql x w		eql x w
  eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0		eql x 0
  if x === w then x = 0 else x = 1
  mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0
  add y 25	add y 25	add y 25	add y 25	add y 25	add y 25	add y 25	add y 25	add y 25	add y 25	add y 25	add y 25	add y 25	add y 25
  mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x
  add y 1		add y 1		add y 1		add y 1		add y 1		add y 1		add y 1		add y 1		add y 1		add y 1		add y 1		add y 1		add y 1		add y 1
  y = 25 * x + 1
  y = x === w ? 1 : 26
  mul z y		mul z y		mul z y		mul z y		mul z y		mul z y		mul z y		mul z y		mul z y		mul z y		mul z y		mul z y		mul z y		mul z y
if (x !== w) z *= 26

  mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0		mul y 0
  add y w		add y w		add y w		add y w		add y w		add y w		add y w		add y w		add y w		add y w		add y w		add y w		add y w		add y w
y = w

add y 16	add y 3		add y 2		add y 7		add y 13	add y 6		add y 10	add y 11	add y 6		add y 5		add y 11	add y 4		add y 4		add y 6
***

mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x		mul y x
add z y		add z y		add z y		add z y		add z y		add z y		add z y		add z y		add z y		add z y		add z y		add z y		add z y		add z     




add x 11
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 3
mul y x
add z y

0   inp w
1   mul x 0
2   add x z
3   mod x 26
4   div z 1  ***
5   add x 12 ***
6   eql x w
7   eql x 0
8   mul y 0
9   add y 25
10  mul y x
11  add y 1
12  mul z y
13  mul y 0
14  add y w
15  add y 2 ***
16  mul y x
17  add z y

inp w
mul x 0
add x z
mod x 26
div z 1
add x 11
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 7 
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 26
add x -10
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 13
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 1
add x 15
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 6
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 26
add x -14
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 10
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 1
add x 10
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 11
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 26
add x -4
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 6
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 26
add x -3
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 5
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 1
add x 13
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 11
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 26
add x -3
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 4
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 26
add x -9
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 4
mul y x
add z y
inp w
mul x 0
add x z
mod x 26
div z 26
add x -12
eql x w
eql x 0
mul y 0
add y 25
mul y x
add y 1
mul z y
mul y 0
add y w
add y 6
mul y x
add z y
*/
