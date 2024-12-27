import math
from itertools import islice
from typing import Iterator

from aoc import main
from aoc.util import chunks, ocr


def parse(s: str) -> Iterator[int]:
    X = 1
    for line in s.splitlines():
        match line.split(" "):
            case ["noop"]:
                yield X
            case ["addx", value]:
                yield X
                yield X
                X += int(value)


def signal_strengths(X: Iterator[int], start=19, step=40):
    return sum(
        x * (i * step + start + 1) for i, x in enumerate(islice(X, start, 240, step))
    )


def crt(X: Iterator[int]):
    display = [" "] * 240
    for cycle, x in enumerate(X):
        if abs(math.fmod(x, 40) - math.fmod(cycle, 40)) < 2:
            display[cycle] = "#"
    return ["".join(row) for row in chunks(display, 40)]


if __name__ == "__main__":
    main(
        lambda s: signal_strengths(parse(s)),
        lambda s: ocr(crt(parse(s)), "4x6"),
    )
