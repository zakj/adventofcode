from collections.abc import Iterable
from typing import Callable, Iterable, Iterator

from util import IterableClass

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

    def get(self, item: Point, default: T | None = None) -> T | None:
        return self.data.get(item)


def neighbors(p: Point) -> Iterable[Point]:
    x, y = p
    for dx, dy in Dir:
        yield (x + dx, y + dy)


def mdist(a: Point, b: Point):
    ax, ay, bx, by = *a, *b
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


def find_bounds(points: Iterable[Point]) -> Rect:
    if not points:
        raise ValueError
    first = next(p for p in points)
    minx, miny = first
    maxx, maxy = first
    for x, y in points:
        minx = min(x, minx)
        maxx = max(x, maxx)
        miny = min(y, miny)
        maxy = max(y, maxy)
    return (minx, miny), (maxx, maxy)
