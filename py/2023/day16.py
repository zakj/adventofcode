from collections import deque

from aoc import main
from coords import Point, addp


# TODO consider factoring this out into parse.py, it's more broadly useful
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

    def get(self, name: Point, default: str | None = None) -> str | None:
        return self.data.get(name)


# TODO: not using coords.Dir, because Enum.__hash__ is slow. maybe just put this into coords instead?
class Dir:
    N = (0, -1)
    E = (1, 0)
    S = (0, 1)
    W = (-1, 0)


REFLECTORS: dict[str, dict[Point, Point]] = {
    "/": {Dir.E: Dir.N, Dir.N: Dir.E, Dir.W: Dir.S, Dir.S: Dir.W},
    "\\": {Dir.E: Dir.S, Dir.N: Dir.W, Dir.W: Dir.N, Dir.S: Dir.E},
}
SPLITTERS: dict[str, set[Point]] = {
    "-": {Dir.E, Dir.W},
    "|": {Dir.N, Dir.S},
}


def part1(s: str) -> int:
    grid = Grid(s)
    return walk(grid, (0, 0), Dir.E)


def part2(s: str) -> int:
    grid = Grid(s)
    best = 0
    for x in range(grid.width):
        best = max(best, walk(grid, (x, 0), Dir.S))
        best = max(best, walk(grid, (x, grid.height - 1), Dir.N))
    for y in range(grid.height):
        best = max(best, walk(grid, (0, y), Dir.E))
        best = max(best, walk(grid, (grid.width - 1, y), Dir.W))
    return best


def walk(grid: Grid, start: Point, dir: Point):
    seen = set()
    q: deque[tuple[Point, Point]] = deque([(start, dir)])
    while q:
        pos, dir = q.popleft()
        if (pos, dir) in seen:
            continue
        c = grid.get(pos)
        if c is None:
            continue

        seen.add((pos, dir))
        if c in REFLECTORS:
            dir = REFLECTORS[c][dir]
            pos = addp(pos, dir)
            q.append((pos, dir))
        elif c in SPLITTERS:
            one, two = SPLITTERS[c]
            q.append((addp(pos, one), one))
            q.append((addp(pos, two), two))
        elif c == ".":
            q.append((addp(pos, dir), dir))
    return len(set(p for p, d in seen))


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
