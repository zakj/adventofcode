from heapq import heappop, heappush

from aoc import main
from coords import Dir, Grid, Point, Vector, addp, opposite

# heat, pos, last dir, count since turning
State = tuple[int, Point, Vector, int]


def min_heat_loss(grid: Grid[int], max_dir=3, min_dir=0) -> int:
    q: list[State] = [
        (0, (0, 0), Dir.E, 0),
        (0, (0, 0), Dir.S, 0),
    ]
    seen: set[tuple[Point, Vector, int]] = set()
    goal = (grid.width - 1, grid.height - 1)
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
