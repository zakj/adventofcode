from collections.abc import Iterable
from enum import Enum
from typing import Iterable, Iterator

import numpy as np
import numpy.typing as npt
from util import IterableClass

Point = tuple[int, int]
Rect = tuple[Point, Point]
Point3 = tuple[int, int, int]
Vector = npt.NDArray[np.int8]
VVector = tuple[int, int]  # TODO


class Dir(Enum):
    N = (0, -1)
    E = (1, 0)
    S = (0, 1)
    W = (-1, 0)
    U = (0, -1)
    R = (1, 0)
    D = (0, 1)
    L = (-1, 0)


# TODO replace Dir uses with this, and then rename
class VDir(metaclass=IterableClass[VVector]):
    N: VVector = (0, -1)
    E: VVector = (1, 0)
    S: VVector = (0, 1)
    W: VVector = (-1, 0)

    @classmethod
    def classiter(cls) -> Iterator[VVector]:
        return iter([cls.N, cls.E, cls.S, cls.W])


def neighbors(p: Point) -> Iterable[Point]:
    x, y = p
    for dx, dy in VDir:
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
