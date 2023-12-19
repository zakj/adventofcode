import itertools

import numpy as np
from aoc import main
from coords import Dir, Vector


def parse(s: str) -> list[Vector]:
    rv = []
    for line in s.splitlines():
        dir, count = line.split(" ")
        rv.extend([np.array(Dir.parse(dir))] * int(count))
    return rv


def follow(t: Vector, h: Vector) -> Vector:
    delta = h - t
    return t if all(abs(delta) < 2) else t + np.sign(delta)


def walk(moves: list[Vector], n: int):
    origin = np.array((0, 0))
    visits = itertools.accumulate(moves, initial=origin)
    for _ in range(n - 1):
        visits = itertools.accumulate(visits, follow, initial=origin)
    return len(set(tuple(p) for p in visits))


if __name__ == "__main__":
    main(
        lambda s: walk(parse(s), 2),
        lambda s: walk(parse(s), 10),
    )
