import math
import re

from aoc import main
from coords import Point


def parse(s: str):
    symbols: dict[Point, str] = {}
    numbers: list[tuple[int, set[Point]]] = []

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


def part1(symbols, numbers) -> int:
    return sum(v for v, adj in numbers if adj & symbols.keys())


def part2(symbols, numbers) -> int:
    tot = 0
    for p in [p for p, c in symbols.items() if c == "*"]:
        parts = [value for value, adj in numbers if p in adj]
        if len(parts) == 2:
            tot += math.prod(parts)
    return tot


if __name__ == "__main__":
    main(
        lambda s: part1(*parse(s)),
        lambda s: part2(*parse(s)),
    )
