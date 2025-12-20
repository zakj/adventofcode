from itertools import combinations, pairwise

from aoc import main
from aoc.collections import SummedAreaTable
from aoc.coords import (
    Dir,
    Point,
    area,
    find_bounds,
    line_between,
)
from aoc.parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> Point:
    x, y = all_numbers(line)
    return x, y


def largest_rectangle(input: str) -> int:
    red_tiles = parse(input)
    return max(area(a, b) for a, b in combinations(red_tiles, 2))


def compress(points: list[Point]) -> dict[Point, Point]:
    uniq_x = list(sorted({p[0] for p in points}))
    uniq_y = list(sorted({p[1] for p in points}))
    x_map = {x: i for i, x in enumerate(uniq_x)}
    y_map = {y: i for i, y in enumerate(uniq_y)}
    return {(x, y): (x_map[x], y_map[y]) for x, y in points}


def largest_contained_rectangle(input: str):
    red_tiles = parse(input)
    to_compressed = compress(red_tiles)
    compressed_tiles = list(to_compressed.values())
    is_outside: dict[Point, bool] = {p: False for p in compressed_tiles}

    # mark the border as known-inside for flood fill
    for a, b in pairwise([compressed_tiles[-1], *compressed_tiles]):
        for p in line_between(a, b):
            is_outside[p] = False

    # flood fill the outside; centroid to fill inside doesn't work due to the concave shape.
    # include a guaranteed-empty border so flood doesn't get stuck
    (minx, miny), (maxx, maxy) = find_bounds(compressed_tiles)
    minx, miny = minx - 1, miny - 1
    maxx, maxy = maxx + 1, maxy + 1

    # TODO is there a cleaner way?
    def in_grid(p: Point) -> bool:
        return minx <= p[0] <= maxx and miny <= p[1] <= maxy

    queue = {(minx, miny)}
    while queue:
        cur = queue.pop()
        if cur in is_outside:
            continue
        is_outside[cur] = True
        queue |= {n for n in Dir.neighbors(cur) if in_grid(n)}

    inside_area = SummedAreaTable(
        maxx,
        maxy,
        lambda p: 0 if is_outside.get(p) else 1,
    )

    max_area = 0
    for a, b in combinations(red_tiles, 2):
        ca, cb = to_compressed[a], to_compressed[b]
        if area(ca, cb) == inside_area[ca, cb]:
            max_area = max(max_area, area(a, b))
    return max_area


if __name__ == "__main__":
    main(
        largest_rectangle,
        largest_contained_rectangle,
    )
