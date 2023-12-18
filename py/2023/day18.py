from aoc import main
from coords import Dir, Point


def shoelace(vertices: list[Point]) -> int:
    area = 0
    (x, y), *rest = vertices
    for nx, ny in rest:
        area += x * ny - nx * y + abs(nx - x) + abs(ny - y)
        x, y = nx, ny
    return area // 2 + 1


def parse_simple(s: str) -> list[Point]:
    DIRS = {"U": Dir.N, "R": Dir.E, "D": Dir.S, "L": Dir.W}
    x, y = 0, 0
    points: list[Point] = [(x, y)]
    for line in s.splitlines():
        dir, length, *_ = line.split(" ")
        dx, dy = DIRS[dir]
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
