import functools
import heapq
from dataclasses import dataclass, field
from typing import Any, Tuple

from aoc import solve
from coords import Dir, Point

blizzard_directions = {
    "^": Dir.N,
    ">": Dir.E,
    "v": Dir.S,
    "<": Dir.W,
}

# Point = Tuple[int, int]
Blizzard = Tuple[Point, Dir]


def parse_old(s: str) -> Tuple[set[Point], list[Blizzard]]:
    walkable = set()
    blizzards = []
    for y, line in enumerate(s.splitlines()):
        for x, c in enumerate(line):
            if c == "#":
                continue
            p = Point(x, y)
            walkable.add(p)
            if c in blizzard_directions:
                blizzards.append((p, blizzard_directions[c]))
    return frozenset(walkable), tuple(blizzards)


@functools.cache
def blizzards_at(blizzards: tuple[Blizzard], walkable, t: int) -> set[Point]:
    # TODO: slow/duplicated
    # print("max bliz", t)
    walk = {
        Dir.N: (sorted({p.y for p in walkable}, reverse=True)[1:-1]),
        Dir.E: (sorted({p.x for p in walkable})),
        Dir.S: (sorted({p.y for p in walkable})[1:-1]),
        Dir.W: (sorted({p.x for p in walkable}, reverse=True)),
    }
    rv = set()
    for start, dir in blizzards:
        range = walk[dir]
        start_index = range.index(start.x if dir in [Dir.E, Dir.W] else start.y)
        index = (start_index + t) % len(range)
        value = range[index]
        cur = Point(value, start.y) if dir in [Dir.E, Dir.W] else Point(start.x, value)
        rv.add(cur)
    return rv


@dataclass(order=True)
class HeapItem:
    priority: int
    item: Any = field(compare=False)


def part1(walkable: set[Point], blizzards: tuple[Blizzard]):
    walk = {
        Dir.N: (sorted({p.y for p in walkable}, reverse=True)[1:-1]),
        Dir.E: (sorted({p.x for p in walkable})),
        Dir.S: (sorted({p.y for p in walkable})[1:-1]),
        Dir.W: (sorted({p.x for p in walkable}, reverse=True)),
    }
    start = next(p for p in walkable if p.y == walk[Dir.S][0] - 1)
    goal = next(p for p in walkable if p.y == walk[Dir.N][0] + 1)

    q = [HeapItem(start.distance(goal), (0, start))]
    seen = set()
    while q:
        t, p = heapq.heappop(q).item
        if p == goal:
            return t
        t += 1
        current_blizzards = blizzards_at(blizzards, frozenset(walkable), t)
        for n in (p + d.value for d in Dir):
            if n in walkable and n not in current_blizzards and (t, n) not in seen:
                seen.add((t, n))
                heapq.heappush(q, HeapItem(n.distance(goal) + t, (t, n)))
        if p not in current_blizzards:
            if (t, p) not in seen:
                seen.add((t, p))
                heapq.heappush(q, HeapItem(p.distance(goal) + t, (t, p)))


# def doit(
#     walkable: set[Point],
#     blizzards: tuple[Blizzard],
#     start: Point,
#     goal: Point,
#     t: int = 0,
# ):
#     q = [HeapItem(start.distance(goal), (t, start))]
#     seen = set()
#     while q:
#         t, p = heapq.heappop(q).item
#         if p == goal:
#             return t
#         t += 1
#         current_blizzards = blizzards_at(blizzards, frozenset(walkable), t)
#         for n in (p + d.value for d in Dir):
#             if n in walkable and n not in current_blizzards and (t, n) not in seen:
#                 seen.add((t, n))
#                 heapq.heappush(q, HeapItem(n.distance(goal) + t, (t, n)))
#         if p not in current_blizzards:
#             if (t, p) not in seen:
#                 seen.add((t, p))
#                 heapq.heappush(q, HeapItem(p.distance(goal) + t, (t, p)))


# def part2(walkable: set[Point], blizzards: tuple[Blizzard]):
#     walk = {
#         Dir.N: (sorted({p.y for p in walkable}, reverse=True)[1:-1]),
#         Dir.E: (sorted({p.x for p in walkable})),
#         Dir.S: (sorted({p.y for p in walkable})[1:-1]),
#         Dir.W: (sorted({p.x for p in walkable}, reverse=True)),
#     }
#     start = next(p for p in walkable if p.y == walk[Dir.S][0] - 1)
#     goal = next(p for p in walkable if p.y == walk[Dir.N][0] + 1)

#     one = doit(walkable, blizzards, start, goal)
#     print(1, one)
#     two = doit(walkable, blizzards, goal, start, one)
#     print(2, two)
#     three = doit(walkable, blizzards, start, goal, two)
#     print(3, three)

#     return three


def mod(x: int, mod: int, min: int = 0):
    """x % mod, but shifted to account for a min value. Handles negatives."""
    n = mod - min
    return (x + n - min) % n + min


def walk(
    walkable: frozenset[Point],
    blizzards: tuple[Blizzard],
    start: Point,
    goal: Point,
    t: int = 0,
):
    start = (start.x, start.y)
    goal = (goal.x, goal.y)
    dist = lambda ax, ay, bx, by: abs(ax - bx) + abs(ay - by)
    min_x = min(p.x for p in walkable)
    max_x = max(p.x for p in walkable)
    min_y = min(p.y for p in walkable) + 1
    max_y = max(p.y for p in walkable) - 1

    # q = [HeapItem(dist(*start, *goal), (t, start))]
    P = Tuple[int, int]
    q: set[P] = {start}
    # seen = set()
    walkable_local = frozenset[P]((p.x, p.y) for p in walkable)
    blizzards_local = [(p.x, p.y, d.value.x, d.value.y) for p, d in blizzards]
    neighbor_vectors = (
        (0, 0),
        (0, 1),
        (1, 0),
        (0, -1),
        (-1, 0),
    )
    while goal not in q:
        t += 1
        bliz = {
            (mod(x + t * dx, max_x + 1, min_x), mod(y + t * dy, max_y + 1, min_y))
            for x, y, dx, dy in blizzards_local
        }
        q = {(px + dx, py + dy) for dx, dy in neighbor_vectors for px, py in q}
        q &= walkable_local - bliz
    return t

    # while q:
    #     t, p = heapq.heappop(q).item
    #     if p == goal:
    #         print(f">> goal {goal} reached after {t} steps, q size {len(q)}")
    #         return t
    #     t += 1
    #     if (t, p) in seen:
    #         continue

    #     if t not in bliz_at:
    #         bliz_at[t] = {
    #             (mod(x + t * dx, max_x + 1, min_x), mod(y + t * dy, max_y + 1, min_y))
    #             for x, y, dx, dy in blizzards_local
    #         }
    #     for n in ((p[0] + dx, p[1] + dy) for dx, dy in neighbor_vectors):
    #         if n in walkable_local and n not in bliz_at[t] and (t, n) not in seen:
    #             seen.add((t, n))
    #             heapq.heappush(q, HeapItem(dist(*n, *goal) + t, (t, n)))
    #     if t == 24 and start == (6, 5):
    #         print(f">> from {start}, q: {q}")
    #         return 18 + 23


TPoint = Tuple[int, int]
TBlizzard = Tuple[TPoint, TPoint]


def parse(s: str) -> Tuple[frozenset[TPoint], tuple[TBlizzard]]:
    walkable = set[TPoint]()
    blizzards: list[TBlizzard] = []
    dir_map = {
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
                blizzards.append(((x, y), dir))
    return frozenset(walkable), tuple(blizzards)


# TODO: GOOD! cleanup
def part1v2(walkable: set[Point], blizzards: tuple[Blizzard]):
    things = {
        Dir.N: (sorted({p.y for p in walkable}, reverse=True)[1:-1]),
        Dir.E: (sorted({p.x for p in walkable})),
        Dir.S: (sorted({p.y for p in walkable})[1:-1]),
        Dir.W: (sorted({p.x for p in walkable}, reverse=True)),
    }
    start = next(p for p in walkable if p.y == things[Dir.S][0] - 1)
    goal = next(p for p in walkable if p.y == things[Dir.N][0] + 1)

    return walk(frozenset(walkable), blizzards, start, goal)


# TODO: GOOD! cleanup
def part2(walkable: set[Point], blizzards: tuple[Blizzard]):
    things = {
        Dir.N: (sorted({p.y for p in walkable}, reverse=True)[1:-1]),
        Dir.E: (sorted({p.x for p in walkable})),
        Dir.S: (sorted({p.y for p in walkable})[1:-1]),
        Dir.W: (sorted({p.x for p in walkable}, reverse=True)),
    }
    start = next(p for p in walkable if p.y == things[Dir.S][0] - 1)
    goal = next(p for p in walkable if p.y == things[Dir.N][0] + 1)

    # from cProfile import Profile
    # prof = Profile()
    # prof.enable()

    one = walk(frozenset(walkable), blizzards, start, goal)
    two = walk(frozenset(walkable), blizzards, goal, start, one)
    three = walk(frozenset(walkable), blizzards, start, goal, two)

    # prof.disable()
    # prof.print_stats()

    return three


EXAMPLE = """
#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#
"""

examples = solve(
    lambda _: part1v2(*parse_old(EXAMPLE)),
    lambda _: part2(*parse_old(EXAMPLE)),
    expect=(18, 54),
)

parts = solve(
    lambda s: part1v2(*parse_old(s)),
    lambda s: part2(*parse_old(s)),
    expect=(297, 856),
)
