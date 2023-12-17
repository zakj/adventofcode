from collections.abc import Iterable
from enum import Enum
from typing import Callable, Generic, Iterable, Iterator, TypeVar

import numpy as np
import numpy.typing as npt
from util import IterableClass

Point = tuple[int, int]
Rect = tuple[Point, Point]
Point3 = tuple[int, int, int]
Vector = npt.NDArray[np.int8]
VVector = tuple[int, int]  # TODO
T = TypeVar("T")


class Dir(metaclass=IterableClass[VVector]):
    N: VVector = (0, -1)
    E: VVector = (1, 0)
    S: VVector = (0, 1)
    W: VVector = (-1, 0)

    @classmethod
    def classiter(cls) -> Iterator[VVector]:
        return iter([cls.N, cls.E, cls.S, cls.W])


class Grid(Generic[T]):
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


def opposite(d: VVector) -> VVector:
    x, y = d
    return (-x, -y)


def addp(p: Point, d: VVector) -> Point:
    return p[0] + d[0], p[1] + d[1]


def subp(p: Point, d: VVector) -> Point:
    return p[0] - d[0], p[1] - d[1]


def turn_right(d: VVector) -> Point:
    x, y = d
    return -y, x


def turn_left(d: VVector) -> Point:
    x, y = d
    return y, -x


def turn_right_around(dir: Vector, axis: Vector) -> Vector:
    return np.cross(dir, axis)


def turn_left_around(dir: Vector, axis: Vector) -> Vector:
    return np.cross(axis, dir)


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
