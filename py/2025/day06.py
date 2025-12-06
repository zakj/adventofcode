import re
from math import prod

from aoc import main


def part1(input: str):
    lines = [re.split(r"\s+", line.strip()) for line in input.splitlines()]
    grand_total = 0
    for x in range(len(lines[0])):
        problem = []
        for y in range(len(lines)):
            problem.append(lines[y][x])
        op = problem.pop()
        if op == "*":
            grand_total += prod(int(n) for n in problem)
        elif op == "+":
            grand_total += sum(int(n) for n in problem)
    return grand_total


def part2(input: str):
    lines = input.splitlines()
    operators = lines.pop()
    col_widths = []
    width = 0
    for i, c in enumerate(operators):
        if c == " ":
            width += 1
        elif width:
            col_widths.append(width)
            width = 0
    col_widths.append(width + 1)

    total = 0
    start = 0
    for i, width in enumerate(col_widths):
        op = operators[start]
        nums = []
        for line in lines:
            nums.append(line[start : start + width])
        start = start + width + 1
        resolved = list(zip(*(reversed(n) for n in nums)))
        resolved = [int("".join(n)) for n in resolved]
        if op == "*":
            total += prod(int(n) for n in resolved)
        elif op == "+":
            total += sum(int(n) for n in resolved)
    return total


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
