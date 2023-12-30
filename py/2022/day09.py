import itertools

from aoc import main
from coords import Dir, Point
from coords import VVector as Vector
from coords import addp, subp


def parse(s: str) -> list[Vector]:
    rv = []
    for line in s.splitlines():
        dir, count = line.split(" ")
        rv.extend([Dir.parse(dir)] * int(count))
    return rv


def sign(v: Vector) -> Vector:
    _sign = lambda n: -1 if n < 0 else 1 if n > 0 else 0
    return (_sign(v[0]), _sign(v[1]))


def follow(t: Point, h: Point) -> Point:
    delta = subp(h, t)
    return t if all(abs(x) < 2 for x in delta) else addp(t, sign(delta))


def walk(moves: list[Vector], n: int):
    origin = (0, 0)
    visits = itertools.accumulate(moves, addp, initial=origin)
    for _ in range(n - 1):
        visits = itertools.accumulate(visits, follow, initial=origin)
    return len(set(tuple(p) for p in visits))


if __name__ == "__main__":
    main(
        lambda s: walk(parse(s), 2),
        lambda s: walk(parse(s), 10),
    )
