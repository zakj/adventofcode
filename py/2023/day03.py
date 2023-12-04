import math
import re

from aoc import main
from coords import Point

Symbols = dict[Point, str]
Numbers = list[tuple[int, set[Point]]]


def parse(s: str) -> tuple[Symbols, Numbers]:
    symbols: Symbols = {}
    numbers: Numbers = []

    for y, line in enumerate(s.splitlines()):
        for match in re.finditer(r"[^.\d]", line):
            symbols[match.start(), y] = match[0]
        for match in re.finditer(r"\d+", line):
            adj: set[Point] = set()
            for yy in [-1, 0, 1]:
                for x in range(match.start() - 1, match.end() + 1):
                    adj.add((x, y + yy))
            numbers.append((int(match[0]), adj))

    return symbols, numbers


def part_numbers(symbols: Symbols, numbers: Numbers) -> list[int]:
    return [v for v, adj in numbers if adj & symbols.keys()]


def gear_ratios(symbols: Symbols, numbers: Numbers) -> list[int]:
    ratios = []
    for p in [p for p, c in symbols.items() if c == "*"]:
        parts = [value for value, adj in numbers if p in adj]
        if len(parts) == 2:
            ratios.append(math.prod(parts))
    return ratios


if __name__ == "__main__":
    main(
        lambda s: sum(part_numbers(*parse(s))),
        lambda s: sum(gear_ratios(*parse(s))),
    )
