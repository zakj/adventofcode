import math
from collections.abc import Callable, Iterable, Iterator
from functools import cache

from aoc.util import IterableClass

Point = tuple[int, int]
Vector = tuple[int, int]  # distinct from Point just for bookkeeping
Rect = tuple[Point, Point]
Point3 = tuple[int, int, int]


class Dir(metaclass=IterableClass[Vector]):
    N: Vector = (0, -1)
    E: Vector = (1, 0)
    S: Vector = (0, 1)
    W: Vector = (-1, 0)
    _strings = {N: "NU^", E: "ER>", S: "SDv", W: "WL<"}
    _parse_map = {k: dir for dir, s in _strings.items() for k in s}

    @classmethod
    def classiter(cls) -> Iterator[Vector]:
        return iter([cls.N, cls.E, cls.S, cls.W])

    @classmethod
    @cache
    def neighbors(cls, p: Point) -> Iterable[Point]:
        x, y = p
        return [(x + dx, y + dy) for dx, dy in cls]

    @classmethod
    def parse(cls, s: str) -> Vector:
        return cls._parse_map[s]


class Dir8(metaclass=IterableClass[Vector]):
    N: Vector = (0, -1)
    NE: Vector = (1, -1)
    E: Vector = (1, 0)
    SE: Vector = (1, 1)
    S: Vector = (0, 1)
    SW: Vector = (-1, 1)
    W: Vector = (-1, 0)
    NW: Vector = (-1, -1)

    @classmethod
    # TODO this is slow
    def classiter(cls) -> Iterator[Vector]:
        return iter([cls.N, cls.NE, cls.E, cls.SE, cls.S, cls.SW, cls.W, cls.NW])

    @classmethod
    @cache
    def neighbors(cls, p: Point) -> Iterable[Point]:
        x, y = p
        return [(x + dx, y + dy) for dx, dy in cls]


class Grid[T]:
    height: int
    width: int

    def __init__(self, s: str, mapfn: Callable[[str], T] = str) -> None:
        lines = s.splitlines()
        self.data = {
            (x, y): mapfn(c) for y, line in enumerate(lines) for x, c in enumerate(line)
        }
        self.height = len(lines)
        self.width = len(lines[0])

    def __repr__(self) -> str:
        items = "".join(str(c) for c in sorted(set(self.data.values())))  # type: ignore
        return f'Grid(width={self.width}, height={self.height}, items="{items}")'

    def __contains__(self, item: Point) -> bool:
        return item in self.data

    def __getitem__(self, item: Point) -> T:
        return self.data[item]

    def __setitem__(self, item: Point, value: T) -> None:
        self.data[item] = value

    def find(self, value: T) -> Point:
        return next(k for k, v in self.data.items() if v == value)

    def findall(self, value: T) -> list[Point]:
        return [k for k, v in self.data.items() if v == value]

    def get(self, item: Point, default: T | None = None) -> T | None:
        return self.data.get(item, default)

    def display(self) -> None:
        for y in range(self.height):
            print("".join(str(self[x, y]) for x in range(self.width)))


def mdist(a: Point, b: Point):
    (ax, ay), (bx, by) = a, b
    return abs(ax - bx) + abs(ay - by)


def opposite(d: Vector) -> Vector:
    x, y = d
    return (-x, -y)


def addp(p: Point, d: Vector) -> Point:
    return p[0] + d[0], p[1] + d[1]


def subp(p: Point, d: Vector) -> Point:
    return p[0] - d[0], p[1] - d[1]


def turn_right(d: Vector) -> Point:
    x, y = d
    return -y, x


def turn_left(d: Vector) -> Point:
    x, y = d
    return y, -x


def area(a: Point, b: Point) -> int:
    return (abs(a[0] - b[0]) + 1) * (abs(a[1] - b[1]) + 1)


def find_bounds(points: Iterable[Point]) -> Rect:
    if not points:
        raise ValueError
    xs, ys = zip(*points)
    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    return (minx, miny), (maxx, maxy)


def line_between(a: Point, b: Point) -> list[Point]:
    xa, ya = a
    xb, yb = b
    dx = xb - xa
    dy = yb - ya
    gcd = math.gcd(dx, dy)
    step_x = dx // gcd
    step_y = dy // gcd
    return [(xa + i * step_x, ya + i * step_y) for i in range(gcd + 1)]


def print_sparse_grid(points: dict[Point, str]) -> None:
    (min_x, min_y), (max_x, max_y) = find_bounds(points)
    width = max_x - min_x + 1
    height = max_y - min_y + 1
    grid = [["." for _ in range(width)] for _ in range(height)]

    for (x, y), c in points.items():
        grid[y - min_y][x - min_x] = c
    for row in grid:
        print("".join(row))
