import re
from itertools import pairwise
from math import prod

from aoc import main

OPERATORS = {"+": sum, "*": prod}


def part1(input: str):
    lines = [re.split(r"\s+", line.strip()) for line in input.splitlines()]
    total = 0
    for x in range(len(lines[0])):
        problem = []
        for y in range(len(lines)):
            problem.append(lines[y][x])
        op = problem.pop()
        total += OPERATORS[op](int(n) for n in problem)
    return total


def part2(input: str):
    lines = input.splitlines()
    operators = lines.pop()
    cols = []
    for i, c in enumerate(operators):
        if c != " ":
            cols.append(i)
    cols.append(len(operators) + 1)

    total = 0
    for start, next_col in pairwise(cols):
        op = operators[start]
        nums = [line[start : next_col - 1] for line in lines]
        nums = list(zip(*(reversed(n) for n in nums)))
        nums = [int("".join(n)) for n in nums]
        total += OPERATORS[op](int(n) for n in nums)
    return total


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
