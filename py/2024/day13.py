from math import gcd

from aoc import main
from aoc.coords import Point, addp
from aoc.parse import all_numbers, paras


def parse(s: str) -> list[tuple[Point, Point, Point]]:
    machines = []
    for machine in paras(s):
        ax, ay = all_numbers(machine[0])
        bx, by = all_numbers(machine[1])
        px, py = all_numbers(machine[2])
        machines.append(((ax, ay), (bx, by), (px, py)))
    return machines


def fewest_tokens(a: Point, b: Point, goal: Point, conversion_error=0) -> int:
    goal = addp(goal, (conversion_error, conversion_error))
    (ax, ay), (bx, by), (goalx, goaly) = a, b, goal
    factor = gcd(ax, ay)
    x_mult = ay // factor
    y_mult = ax // factor
    cdiff = goalx * x_mult - goaly * y_mult
    bdiff = bx * x_mult - by * y_mult

    bvalue = cdiff / bdiff
    numerator = goalx - bvalue * bx
    if numerator % ax != 0:
        return 0
    return int(3 * numerator / ax + bvalue)


conversion_error = 10_000_000_000_000

if __name__ == "__main__":
    main(
        lambda s: sum(fewest_tokens(*values) for values in parse(s)),
        lambda s: sum(fewest_tokens(*values, conversion_error) for values in parse(s)),
    )
