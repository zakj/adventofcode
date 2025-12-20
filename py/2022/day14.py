from itertools import batched

from aoc import main
from aoc.coords import Dir, Dir8, Point, addp, line_between
from aoc.parse import all_numbers, line_parser
from aoc.util import sliding_window

EMITTER = (500, 0)


@line_parser
def parse(line: str):
    points = [(a, b) for a, b in batched(all_numbers(line), 2)]
    return {p for a, b in sliding_window(points, 2) for p in line_between(a, b)}


def drop_sand(filled: set[Point], bottom: int, solid_bottom=False) -> Point:
    cur = EMITTER
    while True:
        if cur[1] == bottom - (1 if solid_bottom else 0):
            break
        elif (
            (p := addp(cur, Dir.S)) not in filled
            or (p := addp(cur, Dir8.SW)) not in filled
            or (p := addp(cur, Dir8.SE)) not in filled
        ):
            pass
        else:
            break
        cur = p
    return cur


def sand_at_rest(s: str) -> int:
    rocks: set[Point] = set.union(*parse(s))
    bottom = max(p[1] for p in rocks)

    sand: set[Point] = set()
    while True:
        grain = drop_sand(rocks | sand, bottom)
        if grain[1] >= bottom:
            break
        sand.add(grain)
    return len(sand)


def sand_until_blocked(s: str) -> int:
    rocks: set[Point] = set.union(*parse(s))
    bottom = max(p[1] for p in rocks) + 2

    sand: set[Point] = set()
    while True:
        grain = drop_sand(rocks, bottom, solid_bottom=True)
        sand.add(grain)
        rocks.add(grain)
        if grain == EMITTER:
            break
    return len(sand)


if __name__ == "__main__":
    main(sand_at_rest, sand_until_blocked, isolate=0)
