from collections import defaultdict
from itertools import count, pairwise
from math import prod

from aoc import main
from coords import Point, Vector, addp
from parse import all_numbers, line_parser

Robot = tuple[Point, Vector]


@line_parser
def parse(line: str) -> Robot:
    px, py, vx, vy = all_numbers(line)
    return (px, py), (vx, vy)


def positions_at(
    robots: list[Robot], width: int, height: int, seconds=1
) -> list[Point]:
    pos = [addp(p, (dx * seconds, dy * seconds)) for p, (dx, dy) in robots]
    return [(x % width, y % height) for x, y in pos]


def safety_factor(s: str, width=101, height=103) -> int:
    midx = width // 2
    midy = height // 2
    quadrants = defaultdict(int)
    for x, y in positions_at(parse(s), width, height, 100):
        if x == midx or y == midy:
            continue
        quadrants[x < midx, y < midy] += 1
    return prod(quadrants.values())


def longest_run(xs: list[int]) -> int:
    best = 0
    run = 0
    for a, b in pairwise(xs):
        if a + 1 == b:
            run += 1
        else:
            best = max(best, run)
            run = 0
    return best


def easter_egg(s: str, width=101, height=103) -> int:
    robots = parse(s)
    for t in count(1):
        locs = {*positions_at(robots, width, height, t)}
        if len(locs) < len(robots):
            continue
        xs = sorted({x for x, y in locs})
        ys = sorted({y for x, y in locs})
        if longest_run(xs) >= 10 and longest_run(ys) >= 10:
            return t
    return 0


if __name__ == "__main__":
    main(safety_factor, easter_egg)
