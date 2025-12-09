from functools import cache
from heapq import heapify, heappop
from itertools import combinations, pairwise
from math import copysign
import sys
from typing import Iterable

from aoc import main, progress, status
from aoc.coords import (
    Dir,
    Dir8,
    Point,
    addp,
    find_bounds,
    mdist,
    print_sparse_grid,
    subp,
)
from aoc.parse import all_numbers


def part1(input: str) -> int:
    red_tiles: set[Point] = set()
    for line in input.splitlines():
        x, y = all_numbers(line)
        red_tiles.add((x, y))
    distances = [(mdist(a, b), a, b) for a, b in combinations(red_tiles, 2)]
    _, a, b = max(*distances)
    return (abs(a[0] - b[0]) + 1) * abs(a[1] - b[1] + 1)


def compress(points: list[Point]) -> dict[Point, Point]:
    uniq_x = list(sorted({p[0] for p in points}))
    uniq_y = list(sorted({p[1] for p in points}))
    x_map = {x: i for i, x in enumerate(uniq_x)}
    y_map = {y: i for i, y in enumerate(uniq_y)}
    return {(x_map[x], y_map[y]): (x, y) for x, y in points}


# must have red tiles in opposite corners, but any other tiles in the rectangle
# must either be red OR green
def part2(input: str):
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

    # print_sparse_grid({p: "#" if v else "x" for p, v in grid.items()})

    # flood fill the outside as outside; centroid doesn't work due to the concave shape
    (minx, miny), (maxx, maxy) = find_bounds(compressed)
    minx -= 1
    miny -= 1
    maxx += 1
    maxy += 1

    def in_grid(p: Point) -> bool:
        return minx <= p[0] <= maxx and miny <= p[1] <= maxy

    # print(find_bounds(grid.keys()))
    # print_sparse_grid({k: "#" if v else "X" for k, v in grid.items()})

    queue = {(minx, miny)}
    while queue:
        cur = queue.pop()
        status(str(len(queue)))
        if cur in grid:
            continue
        grid[cur] = False
        queue |= {n for n in Dir.neighbors(cur) if in_grid(n)}

    # now grid is true for border, false for outside, empty for inside
    # print(find_bounds(grid.keys()))
    # print_sparse_grid({k: "#" if v else "X" for k, v in grid.items()})

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

    # print(find_bounds(summed_area.keys()))
    # print_sparse_grid({k: f"{v:3}" for k, v in summed_area.items()})

    distances = [(mdist(a, b) * -1, a, b) for a, b in combinations(compressed, 2)]
    heapify(distances)
    maxarea = 0
    while distances:
        _, a, b = heappop(distances)
        orig_a, orig_b = compressed_dict[a], compressed_dict[b]
        area = (abs(a[0] - b[0]) + 1) * (abs(a[1] - b[1]) + 1)
        (min_x, min_y), (max_x, max_y) = find_bounds([a, b])
        # XXX
        sum_area = (
            summed_area[max_x, max_y]
            + summed_area.get((min_x - 1, min_y - 1), 0)
            - summed_area.get((max_x, min_y - 1), 0)
            - summed_area.get((min_x - 1, max_y), 0)
        )
        # if orig_a == (9, 5) and orig_b == (2, 3):
        #     print("-- coords", (a, b), (orig_a, orig_b))
        #     print("  br", (max_x, max_y))
        #     print("  sum area, area", sum_area, area)
        #     print("-- summed area")
        #     print(summed_area[max_x, max_y], (max_x, max_y))
        #     print(summed_area.get((min_x - 1, min_y - 1), 0), (min_x - 1, min_y - 1))
        #     print(summed_area.get((max_x, min_y - 1), 0), (max_x, min_y - 1))
        #     print(summed_area.get((min_x - 1, max_y), 0), (min_x - 1, max_y))
        if area == sum_area:
            maxarea = max(
                maxarea,
                (abs(orig_a[0] - orig_b[0]) + 1) * (abs(orig_a[1] - orig_b[1]) + 1),
            )
            # print("FOUND")
            # print("-- coords", (a, b), (orig_a, orig_b))
            # print("  br", (max_x, max_y))
            # print("  sum area, area", sum_area, area)
            # print("-- summed area")
            # print(summed_area[max_x, max_y], (max_x, max_y))
            # print(summed_area.get((min_x - 1, min_y - 1), 0), (min_x - 1, min_y - 1))
            # print(summed_area.get((max_x, min_y - 1), 0), (max_x, min_y - 1))
            # print(summed_area.get((min_x - 1, max_y), 0), (min_x - 1, max_y))

            # print((orig_a, orig_b))
            # return (abs(orig_a[0] - orig_b[0]) + 1) * (abs(orig_a[1] - orig_b[1]) + 1)

    return maxarea

    border = red_tiles | green_tiles
    border = red_tiles
    d = {p: "#" for p in red_tiles}
    d.update({p: "X" for p in green_tiles})
    print_sparse_grid(d)
    return 0
    distances = [(mdist(a, b) * -1, a, b) for a, b in combinations(red_tiles_list, 2)]
    heapify(distances)

    def points_inside(a: Point, b: Point):
        tl, br = find_bounds([a, b])
        tl = addp(tl, Dir8.SE)
        for x in range(tl[0], br[0]):
            for y in range(tl[1], br[1]):
                yield x, y

    border_bounds = find_bounds(border)

    crossings_cache: dict[Point, int] = {}

    # def crossings_from(p: Point) -> int:
    #     if p in crossings_cache:
    #         return crossings_cache[p]

    #     if p[1] < border_bounds[0][1]:
    #         crossings_cache[p] = 0
    #         return 0

    #     # walk north until the boundary or a cached entry
    #     path = []
    #     cur = p
    #     while cur[1] >= border_bounds[0][1] and cur not in crossings_cache:
    #         path.append(cur)
    #         cur = addp(cur, Dir.N)

    #     if cur in crossings_cache:
    #         crossings = crossings_cache[cur]
    #     else:
    #         crossings = 0

    #     # now walk back, caching each entry
    #     for cur in reversed(path):
    #         if cur in border:
    #             crossings += 1
    #         crossings_cache[cur] = crossings

    #     return crossings_cache[p]
    #
    @cache
    def crossings_from(p: Point) -> int: ...

    def is_inside(p: Point):
        return crossings_from(p) % 2 == 1

    print(len(distances))
    for _, a, b in progress(distances):
        # THIS IS ALL TOO SLOW
        # can we compress the grid? and then flood fill?

        ...
        # a and b are corners
        # INSIDE the rectangle formed by those corners, all tiles must be green
        # so find all points within a rectangle
        # check = [(9, 5), (2, 3)]
        # print("checking", a, b)
        # if a in check and b in check:
        # print("checking")
        points = points_inside(a, b)
        # if all_green(a, b):
        # print("checking", a, b)
        if points and all(is_inside(p) for p in points):
            print("success", a, b)
        # print("success", a, b)
        # print(list(points_inside(a, b)))
        # d = {p: "#" for p in red_tiles}
        # d.update({p: "X" for p in green_tiles})
        # d.update({p: "O" if p in green_tiles else "?" for p in points_inside(a, b)})
        # print_sparse_grid(d)
        # return (abs(a[0] - b[0]) + 1) * abs(a[1] - b[1] + 1)
        # else:
        #     check = [(9, 5), (2, 3)]
        #     if a in check and b in check:
        #         print(a, b)
        #         d = {p: "#" for p in red_tiles}
        #         d.update({p: "X" for p in green_tiles})
        #         d.update(
        #             {p: "O" if p in green_tiles else "?" for p in points_inside(a, b)}
        #         )
        #         print_sparse_grid(d)
        #         return


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=0,
    )
