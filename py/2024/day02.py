from collections.abc import Generator
from functools import partial
from itertools import pairwise
from math import copysign

from aoc import main
from parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> list[int]:
    return all_numbers(line)


sign = partial(copysign, 1)


def is_safe(record: list[int]) -> bool:
    direction = sign(record[1] - record[0])
    for a, b in pairwise(record):
        if not 1 <= abs(b - a) <= 3:
            return False
        if sign(b - a) != direction:
            return False
    return True


def is_safe_dampened(record: list[int]) -> bool:
    return any(is_safe(r) for r in remove_element(record))


def remove_element(record: list[int]) -> Generator[list[int]]:
    yield record
    for i in range(len(record)):
        copy = record[:]
        del copy[i]
        yield copy


if __name__ == "__main__":
    main(
        lambda s: len([1 for record in parse(s) if is_safe(record)]),
        lambda s: len([1 for record in parse(s) if is_safe_dampened(record)]),
    )
