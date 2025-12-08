from collections import defaultdict
from heapq import heapify, heappop, nlargest, nsmallest
from itertools import combinations
from math import dist, prod

from aoc import main
from aoc.coords import Point3
from aoc.parse import all_numbers


# <https://en.wikipedia.org/wiki/Disjoint-set_data_structure>
class DisjointSet[T]:
    def __init__(self, xs: list[T]) -> None:
        self._parent = {x: x for x in xs}
        self._size = {x: 1 for x in xs}
        self._count = len(xs)

    def __len__(self) -> int:
        return self._count

    def root(self, x: T) -> T:
        if self._parent[x] != x:
            self._parent[x] = self.root(self._parent[x])  # compress paths
        return self._parent[x]

    def union(self, a: T, b: T) -> None:
        root_a = self.root(a)
        root_b = self.root(b)
        if root_a == root_b:
            return
        self._count -= 1
        if self._size[root_b] > self._size[root_a]:  # merge into largest
            root_a, root_b = root_b, root_a
        self._parent[root_b] = root_a
        self._size[root_a] += self._size[root_b]

    def components(self) -> list[set[T]]:
        components: dict[T, set[T]] = defaultdict(set)
        for x in self._parent:
            components[self.root(x)].add(x)
        return list(components.values())

    def sizes(self) -> list[int]:
        roots = {self.root(p) for p in self._parent}
        return [self._size[root] for root in roots]


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


def three_largest_circuits(
    distances: list[Distance], circuits: Circuits, connections: int
) -> int:
    for _, a, b in nsmallest(connections, distances):
        circuits.union(a, b)
    return prod(nlargest(3, circuits.sizes()))


def connect_all_circuits(
    distances: list[Distance], circuits: DisjointSet[Point3]
) -> int:
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
