import math
from collections.abc import Iterable
from itertools import batched, pairwise

from aoc import main
from aoc.coords import Dir, Dir8, Grid, Point, addp
from aoc.parse import all_numbers, line_parser
from aoc.util import sliding_window

EMITTER = (500, 0)


# TODO: coords.py
def line_between(a: Point, b: Point) -> list[Point]:
    xa, ya = a
    xb, yb = b
    dx = xb - xa
    dy = yb - ya
    gcd = math.gcd(dx, dy)
    step_x = dx // gcd
    step_y = dy // gcd
    return [(xa + i * step_x, ya + i * step_y) for i in range(gcd + 1)]


@line_parser
def parse(line: str):
    points = [(a, b) for a, b in batched(all_numbers(line), 2)]
    rocks = set()
    for a, b in sliding_window(points, 2):
        rocks |= set(line_between(a, b))
    return rocks


# TODO move to coords.py
def print_sparse_grid(points: dict[Point, str]) -> None:
    xs, ys = zip(*points)
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    width = max_x - min_x + 1
    height = max_y - min_y + 1
    grid = [["." for _ in range(width)] for _ in range(height)]

    for (x, y), c in points.items():
        grid[y - min_y][x - min_x] = c
    for row in grid:
        print("".join(row))


def drop_sand(filled: set[Point], bottom: int, solid_bottom=False) -> Point:
    cur = EMITTER
    while True:
        if cur[1] == bottom - (1 if solid_bottom else 0):
            break
        elif (p := addp(cur, Dir.S)) not in filled:
            pass
        elif (p := addp(cur, Dir8.SW)) not in filled:
            pass
        elif (p := addp(cur, Dir8.SE)) not in filled:
            pass
        else:
            break
        cur = p
    return cur


def part1(s: str) -> int:
    rocks: set[Point] = set.union(*parse(s))
    bottom = max(p[1] for p in rocks)

    sand: set[Point] = set()
    while True:
        grain = drop_sand(rocks | sand, bottom)
        if grain[1] >= bottom:
            break
        sand.add(grain)
    return len(sand)


def part2(s: str) -> int:
    rocks: set[Point] = set.union(*parse(s))
    bottom = max(p[1] for p in rocks) + 2

    sand: set[Point] = set()
    while True:
        grain = drop_sand(rocks | sand, bottom, solid_bottom=True)
        sand.add(grain)
        if grain == EMITTER:
            break

    d: dict[Point, str] = {EMITTER: "+"}
    d.update({p: "#" for p in rocks})
    d.update({p: "o" for p in sand})
    return len(sand)


if __name__ == "__main__":
    main(
        part1,
        part2,
        profile=1,
    )
