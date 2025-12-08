from heapq import heapify, heappop, nsmallest
from itertools import combinations
from math import dist

from aoc import main
from aoc.coords import Point3
from aoc.parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> Point3:
    x, y, z = all_numbers(line)
    return (x, y, z)


def part1(input: str, *, connections: int) -> int:
    points = parse(input)
    distances = [(dist(a, b), a, b) for a, b in combinations(points, 2)]
    heapify(distances)
    circuits: list[set[Point3]] = [{p} for p in points]
    for _, a, b in nsmallest(connections, distances):
        found_a = next((c for c in circuits if a in c))
        found_b = next((c for c in circuits if b in c))
        if found_a != found_b:
            found_a |= found_b
            circuits.remove(found_b)

    a, b, c, *_ = reversed(sorted(circuits, key=lambda c: len(c)))
    return len(a) * len(b) * len(c)


def part2(input: str) -> int:
    points = parse(input)
    pairs = [(dist(a, b), a, b) for a, b in combinations(points, 2)]
    heapify(pairs)
    circuits: list[set[Point3]] = []
    disconnected = set(points)
    a, b = points[:2]  # avoid a "possibly unbound" type error after the loop
    while disconnected or len(circuits) > 1:
        _, a, b = heappop(pairs)
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
    return a[0] * b[0]


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=0,
    )
