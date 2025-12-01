from typing import Literal

from aoc import main
from aoc.parse import first_number, line_parser

START = 50
DIAL_SIZE = 100

type Turn = tuple[Literal[1] | Literal[-1], int]


@line_parser
def parse(line: str) -> Turn:
    return (-1 if line[0] == "L" else 1, first_number(line))


def zero_counts(turns: list[Turn]) -> int:
    cur = START
    count = 0
    for dir, length in turns:
        cur = (cur + length * dir) % DIAL_SIZE
        if cur == 0:
            count += 1
    return count


def zero_counts_with_pass(turns: list[Turn]):
    cur = START
    count = 0
    for dir, length in turns:
        for _ in range(length):
            cur = (cur + dir) % DIAL_SIZE
            if cur == 0:
                count += 1
    return count


if __name__ == "__main__":
    main(
        lambda s: zero_counts(parse(s)),
        lambda s: zero_counts_with_pass(parse(s)),
    )
