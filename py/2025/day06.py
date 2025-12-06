from itertools import pairwise
from math import prod

from aoc import main

type Problem = tuple[str, list[str]]  # operator, list of padded columns
OPERATORS = {"+": sum, "*": prod}


def parse_problems(input: str) -> list[Problem]:
    *lines, operators = input.splitlines()
    cols = [i for i, c in enumerate(operators) if c != " "] + [len(operators) + 1]
    return [
        (operators[start], [line[start : next_col - 1] for line in lines])
        for start, next_col in pairwise(cols)
    ]


def cephalopod_math(input: str) -> int:
    return sum(
        OPERATORS[op](int(n) for n in nums) for op, nums in parse_problems(input)
    )


def transpose_columns(nums: list[str]) -> list[int]:
    return [int("".join(n)) for n in zip(*(reversed(n) for n in nums))]


def cephalopod_math_rtl(input: str) -> int:
    problems = parse_problems(input)
    return sum(OPERATORS[op](transpose_columns(nums)) for op, nums in problems)


if __name__ == "__main__":
    main(
        cephalopod_math,
        cephalopod_math_rtl,
    )
