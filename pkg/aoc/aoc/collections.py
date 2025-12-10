from collections import defaultdict
from dataclasses import dataclass
from typing import Callable

from aoc.coords import Point, Rect


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


# Facilitates greedy interval merging.
@dataclass(eq=True)
class Range:
    start: int
    end: int

    @classmethod
    def from_str(cls, s: str) -> "Range":
        start, end = s.split("-")
        return Range(int(start), int(end))

    @staticmethod
    def union(*ranges: "Range") -> "list[Range]":
        if not ranges:
            return []
        first, *sorted_ranges = sorted(ranges)
        union = [Range(first.start, first.end)]
        for cur in sorted_ranges:
            try:
                union[-1] |= cur
            except ValueError:
                union.append(Range(cur.start, cur.end))
        return union

    def __lt__(self, other: "Range") -> bool:
        return self.start < other.start

    def __len__(self) -> int:
        return self.end - self.start + 1

    def __contains__(self, other: int) -> bool:
        return self.start <= other <= self.end

    def __or__(self, other: "Range") -> "Range":
        if not (self.start <= other.end + 1 and other.start <= self.end + 1):
            raise ValueError("ranges must overlap or be adjacent")
        return Range(min(self.start, other.start), max(self.end, other.end))

    def overlaps(self, other: "Range") -> bool:
        return self.start <= other.end and other.start <= self.end


# <https://en.wikipedia.org/wiki/Summed-area_table>
class SummedAreaTable:
    def __init__(
        self, width: int, height: int, valuefn: Callable[[Point], int]
    ) -> None:
        self.width = width
        self.height = height
        self.table: dict[Point, int] = defaultdict(int)
        for x in range(width):
            for y in range(height):
                value = valuefn((x, y))
                self.table[x, y] = (
                    value
                    + self.table[x, y - 1]
                    + self.table[x - 1, y]
                    - self.table[x - 1, y - 1]
                )

    def __getitem__(self, rect: Rect, /) -> int:
        a, b = rect
        min_x, max_x = sorted([a[0], b[0]])
        min_y, max_y = sorted([a[1], b[1]])
        return (
            self.table[max_x, max_y]
            + self.table[min_x - 1, min_y - 1]
            - self.table[max_x, min_y - 1]
            - self.table[min_x - 1, max_y]
        )
