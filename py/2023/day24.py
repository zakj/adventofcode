from dataclasses import dataclass
from functools import partial
from itertools import combinations
from math import copysign

from aoc import main
from aoc.parse import all_numbers


@dataclass
class Line:
    px: int
    py: int
    pz: int
    vx: int
    vy: int
    vz: int
    m: float
    b: float


def intersections_in_test_area(s: str, test_area) -> int:
    lines: list[Line] = []
    for line in s.splitlines():
        px, py, pz, vx, vy, vz = all_numbers(line)
        m = vy / vx
        b = py - (m * px)
        lines.append(Line(px, py, pz, vx, vy, vz, m, b))

    total = 0
    sign = partial(copysign, 1)
    for one, two in combinations(lines, 2):
        if one.m == two.m:
            continue

        x = (two.b - one.b) / (one.m - two.m)
        y = one.m * x + one.b

        if (
            sign(one.vx) == sign(x - one.px)
            and sign(two.vx) == sign(x - two.px)
            and sign(one.vy) == sign(y - one.py)
            and sign(two.vy) == sign(y - two.py)
            and test_area[0] <= x <= test_area[1]
            and test_area[0] <= y <= test_area[1]
        ):
            total += 1

    return total


def throw_rock(s: str) -> int:
    stones: list[Line] = []
    for line in s.splitlines():
        px, py, pz, vx, vy, vz = all_numbers(line)
        m = vy / vx
        two = py - (m * px)
        stones.append(Line(px, py, pz, vx, vy, vz, m, two))

    # Clever idea from <https://www.reddit.com/r/adventofcode/comments/18pnycy/comment/keqf8uq/>
    vxs = set(range(-1000, 1000))
    vys = vxs.copy()
    vzs = vxs.copy()
    for one, two in combinations(stones, 2):
        if one.vx == two.vx:
            delta = two.px - one.px
            candidates = set()
            for v in vxs:
                if v != one.vx and delta % (v - one.vx) == 0:
                    candidates.add(v)
            vxs &= candidates
        if one.vy == two.vy:
            delta = two.py - one.py
            candidates = set()
            for v in vys:
                if v != one.vy and delta % (v - one.vy) == 0:
                    candidates.add(v)
            vys &= candidates
        if one.vz == two.vz:
            delta = two.pz - one.pz
            candidates = set()
            for v in vzs:
                if v != one.vz and delta % (v - one.vz) == 0:
                    candidates.add(v)
            vzs &= candidates
    # TODO: this doesn't hold on the example input
    assert len(vxs) == len(vys) == len(vzs) == 1
    vx, vy, vz = vxs.pop(), vys.pop(), vzs.pop()

    one, two = stones[:2]
    one_m = (one.vy - vy) / (one.vx - vx)
    two_m = (two.vy - vy) / (two.vx - vx)
    one_b = one.py - one_m * one.px
    two_b = two.py - two_m * two.px
    px = int((two_b - one_b) / (one_m - two_m))
    py = int(one_m * px + one_b)
    t = (px - one.px) // (one.vx - vx)
    pz = one.pz + (one.vz - vz) * t
    return px + py + pz


if __name__ == "__main__":
    main(intersections_in_test_area, throw_rock)
