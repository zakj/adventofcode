from heapq import heappop, heappush
from typing import Callable, Generic, TypeVar

from aoc import main
from coords import Point
from coords import VDir as Dir
from coords import VVector as Vector
from coords import addp, opposite

Vector = tuple[int, int]
T = TypeVar("T")

# heat, pos, last dir, count since turning
State = tuple[int, Point, Vector, int]


class Grid(Generic[T]):
    height: int
    width: int

    def __init__(self, s: str, mapfn: Callable[[str], T] = str) -> None:
        lines = s.splitlines()
        self.data = {
            (x, y): mapfn(c) for y, line in enumerate(lines) for x, c in enumerate(line)
        }
        self.height = len(lines)
        self.width = len(lines[0])

    def __repr__(self) -> str:
        items = "".join(str(c) for c in sorted(set(self.data.values())))  # type: ignore
        return f'Grid(width={self.width}, height={self.height}, items="{items}")'

    def __getitem__(self, item: Point) -> T:
        return self.data[item]

    def __setitem__(self, item: Point, value: T) -> None:
        self.data[item] = value

    def __contains__(self, item: Point) -> bool:
        return item in self.data

    def get(self, item: Point, default: T | None = None) -> T | None:
        return self.data.get(item)


def min_heat_loss(grid: Grid[int], max_dir=3, min_dir=0) -> int:
    q: list[State] = [
        (0, (0, 0), Dir.E, 0),
        (0, (0, 0), Dir.S, 0),
    ]
    seen: set[tuple[Point, Vector, int]] = set()
    goal = (grid.height - 1, grid.width - 1)
    while q:
        heat, cur, dir, count = heappop(q)
        if cur == goal and count >= min_dir:
            return heat
        if (cur, dir, count) in seen:
            continue
        seen.add((cur, dir, count))

        for ndir in Dir:
            if (
                (dir == ndir and count >= max_dir)
                or (dir != ndir and count < min_dir)
                or ndir == opposite(dir)
            ):
                continue
            neighbor = addp(cur, ndir)
            if neighbor in grid:
                state = (
                    heat + grid[neighbor],
                    neighbor,
                    ndir,
                    count + 1 if dir == ndir else 1,
                )
                heappush(q, state)
    return -1


if __name__ == "__main__":
    main(
        lambda s: min_heat_loss(Grid(s, int), max_dir=3),
        lambda s: min_heat_loss(Grid(s, int), min_dir=4, max_dir=10),
    )
