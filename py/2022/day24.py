from functools import cache, partial
from typing import Callable

from aoc import main
from coords import Dir, Point
from coords import VVector as Vector
from coords import find_bounds
from util import mod

Blizzard = tuple[Point, Vector]


def parse(s: str) -> tuple[frozenset[Point], frozenset[Blizzard]]:
    walkable = set[Point]()
    blizzards = set[Blizzard]()
    for y, line in enumerate(s.splitlines()):
        for x, c in enumerate(line):
            if c == "#":
                continue
            walkable.add((x, y))
            dir = Dir.parse(c)
            if dir := Dir.parse(c):
                blizzards.add(((x, y), dir))
    return frozenset(walkable), frozenset(blizzards)


def walk(
    walkable: frozenset[Point],
    blizzards_at: Callable[[int], set[Point]],
    start: Point,
    goal: Point,
    t: int = 0,
):
    q: set[Point] = {start}
    options = [(0, 0)] + list(Dir)
    while goal not in q:
        t += 1
        q = {(px + dx, py + dy) for dx, dy in options for px, py in q}
        q &= walkable - blizzards_at(t)
    return t


def expedition(
    walkable: frozenset[Point],
    blizzards: frozenset[Blizzard],
    get_snacks: bool = False,
):
    (min_x, min_y), (max_x, max_y) = find_bounds(walkable)
    start = next((x, y) for x, y in walkable if y == min_y)
    goal = next((x, y) for x, y in walkable if y == max_y)
    modx = cache(partial(mod, mod=max_x + 1, min=min_x))
    mody = cache(partial(mod, mod=max_y, min=min_y + 1))

    def blizzards_at(t: int) -> set[Point]:
        return {(modx(x + t * dx), mody(y + t * dy)) for (x, y), (dx, dy) in blizzards}

    t = walk(walkable, blizzards_at, start, goal)
    if get_snacks:
        t = walk(walkable, blizzards_at, goal, start, t)
        t = walk(walkable, blizzards_at, start, goal, t)
    return t


if __name__ == "__main__":
    main(
        lambda s: expedition(*parse(s)),
        lambda s: expedition(*parse(s), get_snacks=True),
    )
