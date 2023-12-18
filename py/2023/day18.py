from collections import deque
from random import randint

from aoc import main
from coords import Dir, Point, addp, find_bounds, neighbors


def find_inside_loop(dug: set[Point], tl: Point, br: Point) -> Point:
    (min_x, min_y), (max_x, max_y) = tl, br
    for y in range(min_y, max_y):
        for x in range(min_x, max_x):
            if (x, y) in dug:
                continue
            crossings = 0
            for cx in range(x + 1, max_x + 1):
                if (cx, y) in dug:
                    crossings += 1
            if crossings % 2 == 1:
                return (x, y)
    raise ValueError


def part1(s: str) -> int:
    DIRS = {"U": Dir.N, "R": Dir.E, "D": Dir.S, "L": Dir.W}
    # if len(s) > 500:
    #     return -1
    cur = (0, 0)
    dug: set[Point] = set([cur])
    for line in s.splitlines():
        # print(f"{line=}")
        dir, length, color = line.split(" ")
        dir = DIRS[dir]
        length = int(length)
        for _ in range(length):
            cur = addp(cur, dir)
            dug.add(cur)
    # print(f"{dug=}")
    tl, br = find_bounds(dug)
    # find one spot that's inside the loop.
    start = find_inside_loop(dug, tl, br)
    # print(f"{start=}")
    q = deque([start])
    (min_x, min_y), (max_x, max_y) = tl, br
    while q:
        cur = q.pop()
        dug.add(cur)
        for n in neighbors(cur):
            x, y = n
            if n not in dug and min_x <= x <= max_x and min_y <= y <= max_y:
                q.append(n)
                dug.add(n)

    return len(dug)


def part2(s: str) -> int:
    DIRS = [Dir.E, Dir.S, Dir.W, Dir.N]
    area = 0
    x, y = 0, 0
    for line in s.splitlines():
        _, value = line.split("#")
        dx, dy = DIRS[int(value[-2])]
        length = int(value[:-2], 16)
        nx = x + dx * length
        ny = y + dy * length
        area += x * ny - nx * y + length
        x, y = nx, ny
    return area // 2 + 1


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
