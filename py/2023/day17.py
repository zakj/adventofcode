from aoc import main
from coords import Point


# XXX copied from 16
class Grid:
    height: int
    width: int

    def __init__(self, s: str) -> None:
        lines = s.splitlines()
        self.data = {
            (x, y): c for y, line in enumerate(lines) for x, c in enumerate(line)
        }
        self.height = len(lines)
        self.width = len(lines[0])

    def __repr__(self) -> str:
        items = "".join(sorted(set(self.data.values())))
        return f'Grid(width={self.width}, height={self.height}, items="{items}")'

    def __getitem__(self, name: Point) -> str:
        return self.data[name]

    def __setitem__(self, name: Point, value: str) -> None:
        self.data[name] = value

    def __contains__(self, item: Point) -> bool:
        return item in self.data

    def get(self, name: Point, default: str | None = None) -> str | None:
        return self.data.get(name)


# TODO: not using coords.Dir, because Enum.__hash__ is slow. maybe just put this into coords instead?
class Dir:
    N = (0, -1)
    E = (1, 0)
    S = (0, 1)
    W = (-1, 0)


OPPOSITE: dict[Point, Point] = {
    Dir.N: Dir.S,
    Dir.S: Dir.N,
    Dir.E: Dir.W,
    Dir.W: Dir.E,
}

from collections import deque
from heapq import heappop, heappush

from coords import addp, mdist


def part1(s: str) -> int:
    grid = Grid(s)
    goal = (grid.height - 1, grid.width - 1)
    State = tuple[
        int, Point, Point, int
    ]  # heat, pos, previous dir, count in previous dir
    start: State = (0, (0, 0), (0, 0), 0)
    # q: deque[tuple[Point, list[Point], int]] = deque([start])
    q: list[State] = [start]
    distance: dict[tuple[Point, Point, int], int] = {}
    best = 9999999999
    while q:
        heat, cur, dir, count = heappop(q)
        # print(f"{cur=} {path=} {heat=}")
        dirs: set[Point] = set([Dir.N, Dir.S, Dir.E, Dir.W])
        if (cur, dir, count) in distance:
            continue
        distance[(cur, dir, count)] = heat
        if count >= 3:
            dirs.remove(dir)
        if dir != (0, 0):
            dirs.remove(OPPOSITE[dir])
        for ndir in dirs:
            neighbor = addp(cur, ndir)
            if neighbor in grid:
                heappush(
                    q,
                    (
                        heat + int(grid[neighbor]),
                        # mdist(neighbor, goal),
                        neighbor,
                        ndir,
                        count + 1 if dir == ndir else 1,
                    ),
                )

    for (cur, _, _), heat in distance.items():
        if cur == goal:
            best = min(best, heat)
    return best


def part2(s: str) -> int:
    grid = Grid(s)
    goal = (grid.height - 1, grid.width - 1)
    State = tuple[
        int, Point, Point, int
    ]  # heat, pos, previous dir, count in previous dir
    start: State = (0, (0, 0), (0, 0), 0)
    q: list[State] = [start]
    distance: dict[tuple[Point, Point, int], int] = {}
    best = 9999999999
    while q:
        heat, cur, dir, count = heappop(q)
        if (cur, dir, count) in distance and distance[cur, dir, count] < heat:
            continue
        distance[(cur, dir, count)] = heat
        dirs: set[Point] = set([Dir.N, Dir.S, Dir.E, Dir.W])
        if dir != (0, 0):
            dirs.remove(OPPOSITE[dir])
        if count < 4 and dir != (0, 0):
            dirs = set([dir])
        elif count >= 10:
            dirs.remove(dir)
        for ndir in dirs:
            neighbor = addp(cur, ndir)
            if neighbor in grid:
                heappush(
                    q,
                    (
                        heat + int(grid[neighbor]),
                        neighbor,
                        ndir,
                        count + 1 if dir == ndir else 1,
                    ),
                )

    for (cur, _, count), heat in distance.items():
        if cur == goal and count >= 4:
            best = min(best, heat)
    return best


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
