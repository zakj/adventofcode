from collections.abc import Iterable
from itertools import accumulate
from typing import Literal

from aoc import main
from aoc.parse import first_number, line_parser

type Rotation = tuple[Literal[1] | Literal[-1], int]


@line_parser
def parse(line: str) -> Rotation:
    return (1 if line[0] == "R" else -1, first_number(line))


def count_zeroes(states: Iterable[int], start=50, size=100) -> int:
    return sum(1 for x in accumulate(states, initial=start) if x % size == 0)


def turns(rotations: Iterable[Rotation]) -> Iterable[int]:
    return [delta * distance for delta, distance in rotations]


def clicks(rotations: Iterable[Rotation]) -> Iterable[int]:
    return [delta for delta, distance in rotations for _ in range(distance)]


if __name__ == "__main__":
    main(
        lambda s: count_zeroes(turns(parse(s))),
        lambda s: count_zeroes(clicks(parse(s))),
    )
