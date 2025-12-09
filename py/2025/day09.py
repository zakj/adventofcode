from functools import cache
from heapq import heapify
from itertools import combinations, pairwise
from math import copysign
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


# stolen from 2023/10


# must have red tiles in opposite corners, but any other tiles in the rectangle
# must either be red OR green
def part2(input: str):
    red_tiles_list: list[Point] = []
    for line in input.splitlines():
        x, y = all_numbers(line)
        red_tiles_list.append((x, y))

    green_tiles: set[Point] = set()
    for a, b in pairwise([red_tiles_list[-1]] + red_tiles_list):
        x, y = subp(b, a)
        x = int(copysign(1, x)) if x else x
        y = int(copysign(1, y)) if y else y
        dir = (x, y)
        cur = addp(a, dir)
        while cur != b:
            green_tiles.add(cur)
            cur = addp(cur, dir)

    red_tiles = set(red_tiles_list)
    # given a border, find a point on the inside of it
    # flood fill via BFS
    #

    # x = round(sum(p[0] for p in red_tiles) / len(red_tiles))
    # y = round(sum(p[1] for p in red_tiles) / len(red_tiles))
    # centroid = (x, y)

    # tl, br = find_bounds(red_tiles)
    # visited = set()
    # queue = {centroid}
    # while queue:
    #     cur = queue.pop()

    #     status(str(len(queue)))
    #     if cur in visited:
    #         continue
    #     if cur in green_tiles:
    #         continue
    #     visited.add(cur)
    #     green_tiles.add(cur)
    #     queue |= {n for n in Dir.neighbors(cur) if n not in green_tiles | red_tiles}

    border = red_tiles | green_tiles
    # d = {p: "#" for p in red_tiles}
    # d.update({p: "X" for p in green_tiles})
    # print_sparse_grid(d)
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

    def crossings_from(p: Point) -> int:
        if p in crossings_cache:
            return crossings_cache[p]

        if p[1] < border_bounds[0][1]:
            crossings_cache[p] = 0
            return 0

        # walk north until the boundary or a cached entry
        path = []
        cur = p
        while cur[1] >= border_bounds[0][1] and cur not in crossings_cache:
            path.append(cur)
            cur = addp(cur, Dir.N)

        if cur in crossings_cache:
            crossings = crossings_cache[cur]
        else:
            crossings = 0

        # now walk back, caching each entry
        for cur in reversed(path):
            if cur in border:
                crossings += 1
            crossings_cache[cur] = crossings

        return crossings_cache[p]

    def is_inside(p: Point):
        return crossings_from(p) % 2 == 1

    uniq = {p[0] for p in red_tiles} | {p[1] for p in red_tiles}
    uniq_sort = sorted(uniq)
    to_compressed = {v: i for i, v in enumerate(uniq_sort)}
    from_compressed = {v: k for k, v in to_compressed.items()}
    d = {(to_compressed[p[0]], to_compressed[p[1]]): "#" for p in red_tiles}
    print_sparse_grid(d)
    return 0

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
        # points = points_inside(a, b)
        # if all_green(a, b):
        # print("checking", a, b)
        # if points and all(is_inside(p) for p in points):
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
