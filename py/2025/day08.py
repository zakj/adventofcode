from heapq import heapify, heappop, nlargest, nsmallest
from itertools import combinations
from math import dist, prod

from aoc import main
from aoc.collections import DisjointSet
from aoc.coords import Point3
from aoc.parse import all_numbers

type Distance = tuple[float, Point3, Point3]
type Circuits = DisjointSet[Point3]


def parse(input: str) -> tuple[list[Distance], Circuits]:
    boxes: list[Point3] = []
    for line in input.splitlines():
        x, y, z = all_numbers(line)
        boxes.append((x, y, z))
    distances = [(dist(a, b), a, b) for a, b in combinations(boxes, 2)]
    circuits = DisjointSet(boxes)
    return distances, circuits


def three_largest_circuits(distances: list[Distance], circuits: Circuits, connections: int) -> int:
    for _, a, b in nsmallest(connections, distances):
        circuits.union(a, b)
    return prod(nlargest(3, circuits.sizes()))


def connect_all_circuits(distances: list[Distance], circuits: DisjointSet[Point3]) -> int:
    heapify(distances)
    while True:
        _, a, b = heappop(distances)
        circuits.union(a, b)
        if len(circuits) == 1:
            return a[0] * b[0]


if __name__ == "__main__":
    main(
        lambda s, connections: three_largest_circuits(*parse(s), connections),
        lambda s: connect_all_circuits(*parse(s)),
    )
