from collections.abc import Callable
from functools import reduce
from itertools import product
from operator import add, mul

from aoc import main
from parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> tuple[int, list[int]]:
    target, *values = all_numbers(line)
    return target, values


def concat(a: int, b: int) -> int:
    return int(f"{a}{b}")


def sum_valid_targets(s: str, ops: list[Callable]) -> int:
    sum = 0
    for target, values in parse(s):
        gaps = len(values) - 1
        for fns in product(ops, repeat=gaps):
            fn = iter(fns)
            if reduce(lambda acc, x: next(fn)(acc, x), values) == target:
                sum += target
                break
    return sum


if __name__ == "__main__":
    main(
        lambda s: sum_valid_targets(s, [add, mul]),
        lambda s: sum_valid_targets(s, [add, mul, concat]),
    )
