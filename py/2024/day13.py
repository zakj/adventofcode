from heapq import heappop, heappush
from itertools import product
from math import gcd

from aoc import main
from coords import Point, addp
from parse import all_numbers, paras


def parse(s: str) -> list[tuple[Point, Point, Point]]:
    machines = []
    for machine in paras(s):
        ax, ay = all_numbers(machine[0])
        bx, by = all_numbers(machine[1])
        px, py = all_numbers(machine[2])
        machines.append(((ax, ay), (bx, by), (px, py)))
    return machines


def fewest_tokens(a: Point, b: Point, goal: Point) -> int | None:
    queue = [(0, (0, 0))]
    while queue:
        cost, cur = heappop(queue)
        if cur == goal:
            return cost
        if cur[0] > goal[0] or cur[1] > goal[1]:
            continue
        heappush(queue, ((cost + 3), addp(cur, a)))
        heappush(queue, ((cost + 1), addp(cur, b)))
    return None


def part1(s: str) -> int:
    machines = parse(s)
    tokens = 0
    for a, b, goal in machines:
        valid = []
        for a_press, b_press in product(range(101), repeat=2):
            if (a[0] * a_press + b[0] * b_press == goal[0]) and (
                a[1] * a_press + b[1] * b_press == goal[1]
            ):
                valid.append(a_press * 3 + b_press)
        if valid:
            tokens += min(valid)
    return tokens


# x = ax * apress + bx * bpress
# y = ay * apress + by * bpress
# ...
# apress = (x - bx * bpress) / ax
# bpress = (x - ax * apress) / bx
# y = ay * apress + by * ((x - ax * apress) / bx)
# (ay * bx - by * ax) * apress + by * x - y * bx = 0


def part2(s: str) -> int:
    machines = parse(s)
    tokens = 0
    conversion_error = 10_000_000_000_000

    for a, b, goal in machines:
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
            continue
        avalue = numerator / ax
        tokens += int(3 * avalue + bvalue)

    return tokens


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
