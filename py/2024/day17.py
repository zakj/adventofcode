from collections import defaultdict
from itertools import pairwise
from math import pi
from typing import DefaultDict

from aoc import main, status


def parse(s: str):
    pass


from parse import all_numbers, paras


def combo(registers, operand) -> int:
    if 0 <= operand <= 3:
        return operand
    if operand == 4:
        return registers[0]
    if operand == 5:
        return registers[1]
    if operand == 6:
        return registers[2]
    if operand == 7:
        raise ValueError


def part1(s: str) -> str:
    registers_str, instructions_str = paras(s)
    registers = all_numbers("".join(registers_str))
    instructions = all_numbers("".join(instructions_str))
    out = []
    pointer = 0
    while pointer < len(instructions):
        instr, operand = instructions[pointer : pointer + 2]
        if instr == 0:  # adv
            registers[0] = int(registers[0] / (2 ** combo(registers, operand)))
        elif instr == 1:  # bxl
            registers[1] ^= operand
        elif instr == 2:  # bst
            registers[1] = combo(registers, operand) % 8
        elif instr == 3:  # jnz
            if registers[0] != 0:
                pointer = operand
                continue
        elif instr == 4:  # bxc
            registers[1] ^= registers[2]
        elif instr == 5:  # out
            out.append(str(combo(registers, operand) % 8))
        elif instr == 6:  # bdv
            registers[1] = int(registers[0] / (2 ** combo(registers, operand)))
        elif instr == 7:  # cdv
            registers[2] = int(registers[0] / (2 ** combo(registers, operand)))
        pointer += 2

    return ",".join(out)


def run(registers, instructions) -> str:
    out = []
    pointer = 0
    while pointer < len(instructions):
        instr, operand = instructions[pointer : pointer + 2]
        if instr == 0:  # adv
            registers[0] = int(registers[0] / (2 ** combo(registers, operand)))
        elif instr == 1:  # bxl
            registers[1] ^= operand
        elif instr == 2:  # bst
            registers[1] = combo(registers, operand) % 8
        elif instr == 3:  # jnz
            if registers[0] != 0:
                pointer = operand
                continue
        elif instr == 4:  # bxc
            registers[1] ^= registers[2]
        elif instr == 5:  # out
            # value = combo(registers, operand) % 8
            # if value != instructions[len(out)]:
            #     return ""
            # print(f"{registers=}")
            out.append(str(combo(registers, operand) % 8))
        elif instr == 6:  # bdv
            registers[1] = int(registers[0] / (2 ** combo(registers, operand)))
        elif instr == 7:  # cdv
            registers[2] = int(registers[0] / (2 ** combo(registers, operand)))
        pointer += 2

    return ",".join(out)


def part2_brute(s: str) -> int:
    registers_str, instructions_str = paras(s)
    registers = all_numbers("".join(registers_str))
    instructions = all_numbers("".join(instructions_str))
    print(registers)
    goal = ",".join(str(instr) for instr in instructions)

    print(run(registers, instructions), goal)
    print(runf(52042868, instructions), goal)
    from itertools import count

    lengths = defaultdict(set)
    # for a in count(800_000_000, step=6_291_456):
    # a = 0
    i = 0
    longest = 0
    while True:
        # a = i * 0o2621633
        a = i * 2113570437709785
        if i % 1_000_000 == 0:
            status(str(a))
        # a = Ast * 8**9 + 0o676236017
        result = runf(a, instructions)
        # if a % 1_000_000 == 0:
        #     # print(result)
        #     # print(goal)
        #     print(lengths)
        #     # print("***")
        #     status(str(a))
        # if len(result) >= 15:
        #     lengths[len(result)].add(a)
        if result == goal:
            return a
        if len(result) > longest:
            print(a, oct(a), longest, len(goal))
            longest = len(result)
        i += 1


import re


def work_backwards(instructions, i, a):
    print([int(x) for x in re.findall("...", bin(a)[2:])])
    a <<= 3
    goal = instructions[i:]
    for incr in range(8):
        if runf(a + incr, instructions) != goal:
            continue
        if i == 0:
            return a + incr
        try:
            return work_backwards(instructions, i - 1, a + incr)
        except ValueError:
            pass
    raise ValueError


def part2(s: str) -> int:
    instructions = all_numbers("".join(paras(s)[1]))
    i = len(instructions) - 1
    return work_backwards(instructions, i, 0)


"""
0o2
0o450
0o1633
0o103633
0o2621633
0o102621633
0o132621633
0o522621633
0o26313030522621635
"""

x = {
    15: {
        822813595,
        822813597,
        829105051,
        829105053,
        889922459,
        889922461,
        957031323,
        957031325,
    }
}

"""
x = {
    11: {},
    15: {
    822813595,
    822813597,
    829105051,
    829105053,
    },
    13: {824910747, 827007899, 824910749, 827007901},
}
6,291,456
2,097,152
"""


def runf(a, instructions):
    A, B, C = a, 0, 0
    out = []
    while A != 0:
        B = A % 8
        B = B ^ 7
        C = int(A / 2**B)
        A = int(A / 2**3)  # each iteration takes 3 bits from the value
        B = B ^ C
        B = B ^ 7
        # print(f"{A, B, C=}")
        value = B % 8
        out.append(value)
    return out


def part2f(s: str) -> int: ...


if __name__ == "__main__":
    main(
        part1,
        part2,
    )


"""
while A != 0:
    B = A % 8
    B = B ^ 7
    C = A / 2**B
    A = A / 2**3
    B = B ^ C
    B = B ^ 7
    out.append(B)

2,4
    bst A
1,7
    bxl 7
7,5
    cdv B
0,3
    adv 3
4,4
    bxc
1,7
    bxl 7
5,5
    out B
3,0
    jnz 0

"""
