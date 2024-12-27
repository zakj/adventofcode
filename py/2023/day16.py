from collections import deque

from aoc import main
from aoc.coords import Dir, Grid, Point, Vector, addp

REFLECTORS: dict[str, dict[Vector, Vector]] = {
    "/": {Dir.E: Dir.N, Dir.N: Dir.E, Dir.W: Dir.S, Dir.S: Dir.W},
    "\\": {Dir.E: Dir.S, Dir.N: Dir.W, Dir.W: Dir.N, Dir.S: Dir.E},
}
SPLITTERS: dict[str, set[Vector]] = {
    "-": {Dir.E, Dir.W},
    "|": {Dir.N, Dir.S},
}


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
    return len(set(p for p, _ in seen))


def best_beam_start(grid: Grid) -> int:
    best = 0
    for x in range(grid.width):
        best = max(best, energize(grid, (x, 0), Dir.S))
        best = max(best, energize(grid, (x, grid.height - 1), Dir.N))
    for y in range(grid.height):
        best = max(best, energize(grid, (0, y), Dir.E))
        best = max(best, energize(grid, (grid.width - 1, y), Dir.W))
    return best


if __name__ == "__main__":
    main(
        lambda s: energize(Grid(s), (0, 0), Dir.E),
        lambda s: best_beam_start(Grid(s)),
    )
