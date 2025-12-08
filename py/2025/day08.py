from itertools import combinations
from math import dist, sqrt

from aoc import main
from aoc.coords import Point3
from aoc.parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> Point3:
    x, y, z = all_numbers(line)
    return (x, y, z)


def dist3(a: Point3, b: Point3) -> float:
    return sqrt(pow(a[0] - b[0], 2) + pow(a[1] - b[2], 2) + pow(a[2] - b[2], 2))


def part1(input: str, connections=1000):
    points = parse(input)
    pairs = combinations(points, 2)
    pairs = list(sorted(pairs, key=lambda ab: dist(ab[0], ab[1])))
    circuits: list[set[Point3]] = []
    for a, b in pairs[:connections]:
        found_a = next((c for c in circuits if a in c), None)
        found_b = next((c for c in circuits if b in c), None)
        if found_a and not found_b:
            found_a.add(b)
        elif found_b and not found_a:
            found_b.add(a)
        elif found_a and found_b:
            if found_a == found_b:
                continue
            found_a |= found_b
            found_b.clear()
        else:
            circuits.append({a, b})

    a, b, c, *_ = reversed(sorted(circuits, key=lambda c: len(c)))
    return len(a) * len(b) * len(c)


def part2(input: str):
    points = parse(input)
    pairs = combinations(points, 2)
    pairs = list(sorted(pairs, key=lambda ab: dist(ab[0], ab[1])))
    circuits: list[set[Point3]] = []
    disconnected = set(points)
    for a, b in pairs:
        found_a = next((c for c in circuits if a in c), None)
        found_b = next((c for c in circuits if b in c), None)
        if found_a and not found_b:
            found_a.add(b)
            disconnected.remove(b)
        elif found_b and not found_a:
            found_b.add(a)
            disconnected.remove(a)
        elif found_a and found_b:
            if found_a == found_b:
                continue
            found_a |= found_b
            circuits.remove(found_b)
        else:
            disconnected.remove(a)
            disconnected.remove(b)
            circuits.append({a, b})
        if len(circuits) == 1 and len(disconnected) == 0:
            return a[0] * b[0]


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
