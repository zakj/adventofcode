from functools import partial
from itertools import pairwise
from math import prod
from typing import Callable

from aoc import main

type Problem = tuple[str, list[str]]  # operator, list of padded cells in the column
OPERATORS = {"+": sum, "*": prod}


def parse_problems(input: str) -> list[Problem]:
    *lines, operators = input.splitlines()
    cols = [i for i, c in enumerate(operators) if c != " "] + [len(operators) + 1]
    return [
        (operators[start], [line[start : next_col - 1] for line in lines])
        for start, next_col in pairwise(cols)
    ]


def transpose_columns(nums: list[str]) -> list[str]:
    return ["".join(n) for n in zip(*(reversed(n) for n in nums))]


def cephalopod_math(
    input: str, mapper: Callable[[list[str]], list[str]] | None = None
) -> int:
    return sum(
        OPERATORS[op](int(n) for n in (mapper(nums) if mapper else nums))
        for op, nums in parse_problems(input)
    )


if __name__ == "__main__":
    main(
        cephalopod_math,
        partial(cephalopod_math, mapper=transpose_columns),
    )
