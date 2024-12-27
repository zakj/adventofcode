from aoc import main
from aoc.parse import all_numbers, paras


def parse(s: str) -> tuple[int, list[int]]:
    registers, instructions_str = paras(s)
    a = all_numbers(registers[0])[0]
    instructions = all_numbers("".join(instructions_str))
    return a, instructions


def run(A: int, instructions: list[int]) -> list[int]:
    def combo(value: int) -> int:
        if 0 <= value <= 3:
            return value
        elif value == 4:
            return A
        elif value == 5:
            return B
        elif value == 6:
            return C
        raise ValueError

    B = C = 0
    out = []
    pointer = 0
    while pointer < len(instructions):
        instr, operand = instructions[pointer : pointer + 2]
        if instr == 0:  # adv
            A = int(A / (2 ** combo(operand)))
        elif instr == 1:  # bxl
            B ^= operand
        elif instr == 2:  # bst
            B = combo(operand) % 8
        elif instr == 3:  # jnz
            if A != 0:
                pointer = operand
                continue
        elif instr == 4:  # bxc
            B ^= C
        elif instr == 5:  # out
            out.append(combo(operand) % 8)
        elif instr == 6:  # bdv
            B = int(A / (2 ** combo(operand)))
        elif instr == 7:  # cdv
            C = int(A / (2 ** combo(operand)))
        pointer += 2

    return out


def program_output(s: str) -> str:
    a, instructions = parse(s)
    out = run(a, instructions)
    return ",".join(str(v) for v in out)


def work_backwards(instructions, i, a):
    a <<= 3
    goal = instructions[i:]
    for incr in range(8):
        if run(a + incr, instructions) != goal:
            continue
        if i == 0:
            return a + incr
        try:
            return work_backwards(instructions, i - 1, a + incr)
        except ValueError:
            pass
    raise ValueError


def find_value_for_a(s: str) -> int:
    _, instructions = parse(s)
    i = len(instructions) - 1
    return work_backwards(instructions, i, 0)


if __name__ == "__main__":
    main(program_output, find_value_for_a)
