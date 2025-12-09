from itertools import combinations, pairwise
from math import copysign

from aoc import main
from aoc.coords import (
    Dir,
    Dir8,
    Point,
    addp,
    find_bounds,
    mdist,
    subp,
)
from aoc.parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> Point:
    x, y = all_numbers(line)
    return x, y


def largest_rectangle(input: str) -> int:
    red_tiles = parse(input)
    distances = [(mdist(a, b), a, b) for a, b in combinations(red_tiles, 2)]
    _, a, b = max(*distances)
    return (abs(a[0] - b[0]) + 1) * abs(a[1] - b[1] + 1)


def compress(points: list[Point]) -> dict[Point, Point]:
    uniq_x = list(sorted({p[0] for p in points}))
    uniq_y = list(sorted({p[1] for p in points}))
    x_map = {x: i for i, x in enumerate(uniq_x)}
    y_map = {y: i for i, y in enumerate(uniq_y)}
    return {(x_map[x], y_map[y]): (x, y) for x, y in points}


def largest_contained_rectangle(input: str):
    red_tiles: list[Point] = []
    for line in input.splitlines():
        x, y = all_numbers(line)
        red_tiles.append((x, y))
    compressed_dict = compress(red_tiles)
    compressed = list(compressed_dict.keys())

    # point -> is inside shape
    grid: dict[Point, bool] = {p: True for p in compressed}

    # mark the border as inside
    for a, b in pairwise([compressed[-1]] + compressed):
        x, y = subp(b, a)
        x = int(copysign(1, x)) if x else x
        y = int(copysign(1, y)) if y else y
        dir = (x, y)
        cur = addp(a, dir)
        while cur != b:
            grid[cur] = True
            cur = addp(cur, dir)

    # flood fill the outside as outside; centroid doesn't work due to the concave shape
    (minx, miny), (maxx, maxy) = find_bounds(compressed)
    minx -= 1
    miny -= 1
    maxx += 1
    maxy += 1

    def in_grid(p: Point) -> bool:
        return minx <= p[0] <= maxx and miny <= p[1] <= maxy

    queue = {(minx, miny)}
    while queue:
        cur = queue.pop()
        if cur in grid:
            continue
        grid[cur] = False
        queue |= {n for n in Dir.neighbors(cur) if in_grid(n)}

    # now grid is true for border, false for outside, empty for inside

    # summed area table of the whole grid
    summed_area: dict[Point, int] = {}
    for x in range(minx, maxx + 1):
        for y in range(miny, maxy + 1):
            p = x, y
            value = 0 if p in grid and not grid[p] else 1
            summed_area[p] = (
                value
                + summed_area.get(addp(p, Dir.N), 0)
                + summed_area.get(addp(p, Dir.W), 0)
                - summed_area.get(addp(p, Dir8.NW), 0)
            )

    maxarea = 0
    for a, b in combinations(compressed, 2):
        area = (abs(a[0] - b[0]) + 1) * (abs(a[1] - b[1]) + 1)
        (min_x, min_y), (max_x, max_y) = find_bounds([a, b])
        sum_area = (
            summed_area[max_x, max_y]
            + summed_area.get((min_x - 1, min_y - 1), 0)
            - summed_area.get((max_x, min_y - 1), 0)
            - summed_area.get((min_x - 1, max_y), 0)
        )
        if area == sum_area:
            orig_a, orig_b = compressed_dict[a], compressed_dict[b]
            maxarea = max(
                maxarea,
                (abs(orig_a[0] - orig_b[0]) + 1) * (abs(orig_a[1] - orig_b[1]) + 1),
            )
    return maxarea


if __name__ == "__main__":
    main(
        largest_rectangle,
        largest_contained_rectangle,
    )
