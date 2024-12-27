from itertools import pairwise

from aoc import main
from aoc.coords import Dir, Point


def shoelace(vertices: list[Point]) -> int:
    area, perimeter = 0, 0
    for (x, y), (nx, ny) in pairwise(vertices):
        area += x * ny - nx * y
        perimeter += abs(nx - x) + abs(ny - y)
    perimeter = perimeter // 2 + 1
    return abs(area) // 2 + perimeter


def parse_simple(s: str) -> list[Point]:
    x, y = 0, 0
    points: list[Point] = [(x, y)]
    for line in s.splitlines():
        dir, length, *_ = line.split(" ")
        dx, dy = Dir.parse(dir)
        length = int(length)
        x = x + dx * length
        y = y + dy * length
        points.append((x, y))
    return points


def parse_hex(s: str) -> list[Point]:
    DIRS = [Dir.E, Dir.S, Dir.W, Dir.N]
    x, y = 0, 0
    points: list[Point] = [(x, y)]
    for line in s.splitlines():
        _, value = line.split("#")
        dx, dy = DIRS[int(value[-2])]
        length = int(value[:-2], 16)
        x = x + dx * length
        y = y + dy * length
        points.append((x, y))
    return points


if __name__ == "__main__":
    main(
        lambda s: shoelace(parse_simple(s)),
        lambda s: shoelace(parse_hex(s)),
    )
