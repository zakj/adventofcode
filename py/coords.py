from collections.abc import Iterable
from dataclasses import dataclass
from enum import Enum

import numpy as np
import numpy.typing as npt

Point = tuple[int, int]
Rect = tuple[Point, Point]
Point3 = tuple[int, int, int]
Vector = npt.NDArray[np.int8]


class Dir(Enum):
    N = (0, -1)
    E = (1, 0)
    S = (0, 1)
    W = (-1, 0)
    U = (0, -1)
    R = (1, 0)
    D = (0, 1)
    L = (-1, 0)


class Dir8(Enum):
    N = (0, -1)
    E = (1, 0)
    S = (0, 1)
    W = (-1, 0)
    NE = (1, -1)
    SE = (1, 1)
    SW = (-1, 1)
    NW = (-1, -1)


def mdist(a: Point, b: Point):
    ax, ay, bx, by = *a, *b
    return abs(ax - bx) + abs(ay - by)


def addp(a: Point, b: Point) -> Point:
    return a[0] + b[0], a[1] + b[1]


def subp(a: Point, b: Point) -> Point:
    return a[0] - b[0], a[1] - b[1]


def turn_right(p: Point) -> Point:
    x, y = p
    return -y, x


def turn_left(p: Point) -> Point:
    x, y = p
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
