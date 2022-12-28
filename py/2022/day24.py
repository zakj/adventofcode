from typing import Callable

from aoc import solve

Point = tuple[int, int]
Blizzard = tuple[Point, Point]


def parse(s: str) -> tuple[frozenset[Point], frozenset[Blizzard]]:
    walkable = set[Point]()
    blizzards = set[Blizzard]()
    dir_map: dict[str, Point] = {
        "^": (0, -1),
        ">": (1, 0),
        "v": (0, 1),
        "<": (-1, 0),
    }

    for y, line in enumerate(s.splitlines()):
        for x, c in enumerate(line):
            if c == "#":
                continue
            walkable.add((x, y))
            dir = dir_map.get(c)
            if dir is not None:
                blizzards.add(((x, y), dir))
    return frozenset(walkable), frozenset(blizzards)


# TODO: unused; put it in utils?
def dist(a: Point, b: Point) -> int:
    ax, ay, bx, by = *a, *b
    return abs(ax - bx) + abs(ay - by)


# TODO: utils?
def mod(x: int, mod: int, min: int = 0):
    """x % mod, but shifted to account for a min value. Handles negatives."""
    n = mod - min
    return (x + n - min) % n + min


# TODO: in coords? with a map to NESW/^>v<?
neighbor_vectors = (
    (0, 1),
    (1, 0),
    (0, -1),
    (-1, 0),
)


def walk(
    walkable: frozenset[Point],
    blizzards_at: Callable[[int], set[Point]],
    start: Point,
    goal: Point,
    t: int = 0,
):
    q: set[Point] = {start}
    next_vectors = neighbor_vectors + ((0, 0),)
    while goal not in q:
        t += 1
        q = {(px + dx, py + dy) for dx, dy in next_vectors for px, py in q}
        q &= walkable - blizzards_at(t)
    return t


def expedition(
    walkable: frozenset[Point],
    blizzards: frozenset[Blizzard],
    get_snacks: bool = False,
):
    min_x = min(x for x, y in walkable)
    max_x = max(x for x, y in walkable)
    min_y = min(y for x, y in walkable) + 1
    max_y = max(y for x, y in walkable) - 1
    start = next((x, y) for x, y in walkable if y == min_y - 1)
    goal = next((x, y) for x, y in walkable if y == max_y + 1)

    def blizzards_at(t: int) -> set[Point]:
        return {
            (mod(x + t * dx, max_x + 1, min_x), mod(y + t * dy, max_y + 1, min_y))
            for (x, y), (dx, dy) in blizzards
        }

    t = walk(walkable, blizzards_at, start, goal)
    if get_snacks:
        t = walk(walkable, blizzards_at, goal, start, t)
        t = walk(walkable, blizzards_at, start, goal, t)
    return t


EXAMPLE = """
#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#
"""

examples = solve(
    lambda _: expedition(*parse(EXAMPLE)),
    lambda _: expedition(*parse(EXAMPLE), get_snacks=True),
    expect=(18, 54),
)

parts = solve(
    lambda s: expedition(*parse(s)),
    lambda s: expedition(*parse(s), get_snacks=True),
    expect=(297, 856),
)
