from collections import deque

from aoc import main
from coords import Point
from coords import VDir as Dir
from coords import VVector as Vector
from coords import addp


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


REFLECTORS: dict[str, dict[Vector, Vector]] = {
    "/": {Dir.E: Dir.N, Dir.N: Dir.E, Dir.W: Dir.S, Dir.S: Dir.W},
    "\\": {Dir.E: Dir.S, Dir.N: Dir.W, Dir.W: Dir.N, Dir.S: Dir.E},
}
SPLITTERS: dict[str, set[Vector]] = {
    "-": {Dir.E, Dir.W},
    "|": {Dir.N, Dir.S},
}


def best_beam_start(grid: Grid) -> int:
    best = 0
    for x in range(grid.width):
        best = max(best, energize(grid, (x, 0), Dir.S))
        best = max(best, energize(grid, (x, grid.height - 1), Dir.N))
    for y in range(grid.height):
        best = max(best, energize(grid, (0, y), Dir.E))
        best = max(best, energize(grid, (grid.width - 1, y), Dir.W))
    return best


# TODO: cache start/dir -> int runs, hash grid on grid.height
def energize(grid: Grid, start: Point, dir: Vector) -> int:
    seen = set()
    q: deque[tuple[Point, Vector]] = deque([(start, dir)])
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
        elif c in SPLITTERS and dir not in SPLITTERS[c]:
            one, two = SPLITTERS[c]
            q.append((addp(pos, one), one))
            q.append((addp(pos, two), two))
        else:
            q.append((addp(pos, dir), dir))
    return len(set(p for p, d in seen))


if __name__ == "__main__":
    main(
        lambda s: energize(Grid(s), (0, 0), Dir.E),
        lambda s: best_beam_start(Grid(s)),
    )
