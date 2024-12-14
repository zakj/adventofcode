from collections import defaultdict
from dataclasses import dataclass
from itertools import count, pairwise
from math import prod

from aoc import main
from coords import Dir, Point, Vector, addp
from parse import all_numbers, line_parser


@dataclass
class Robot:
    point: Point
    vector: Vector

    def move(self, width: int, height: int, times=1) -> None:
        d = self.vector[0] * times, self.vector[1] * times
        p = addp(self.point, d)
        self.point = p[0] % width, p[1] % height

    @property
    def x(self) -> int:
        return self.point[0]

    @property
    def y(self) -> int:
        return self.point[1]


@line_parser
def parse(line: str) -> Robot:
    px, py, vx, vy = all_numbers(line)
    return Robot((px, py), (vx, vy))


def safety_factor(s: str, width=101, height=103) -> int:
    robots = parse(s)
    for robot in robots:
        robot.move(width, height, times=100)

    quadrants = defaultdict(int)
    midx = width // 2
    midy = height // 2
    for robot in robots:
        if robot.x == midx or robot.y == midy:
            continue
        quadrant = addp((0, 0), Dir.W if robot.x < midx else Dir.E)
        quadrant = addp(quadrant, Dir.N if robot.y < midy else Dir.S)
        quadrants[quadrant] += 1
    return prod(quadrants.values())


def longest_run(xs: list[int]) -> int:
    runs = {0}
    run = 0
    for a, b in pairwise(xs):
        if a + 1 == b:
            run += 1
        else:
            runs.add(run)
            run = 0
    return max(runs)


def easter_egg(s: str, width=101, height=103) -> int:
    robots = parse(s)
    for t in count(1):
        for robot in robots:
            robot.move(width, height)
        locs = {r.point for r in robots}
        if len(locs) < len(robots):
            continue
        xs = sorted({x for x, y in locs})
        ys = sorted({y for x, y in locs})
        if longest_run(xs) >= 10 and longest_run(ys) >= 10:
            return t
    return 0


if __name__ == "__main__":
    main(safety_factor, easter_egg)
