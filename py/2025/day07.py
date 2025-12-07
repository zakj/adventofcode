from functools import cache

from aoc import main
from aoc.coords import Dir, Grid, Point, addp


def parse(input: str) -> tuple[Grid, Point]:
    grid = Grid(input)
    return grid, grid.find("S")


def count_splits(grid: Grid, start: Point) -> int:
    visited = {start}
    queue = [start]
    splits = 0
    while queue:
        beam = queue.pop()
        beam = addp(beam, Dir.S)
        if beam in visited:
            continue
        visited.add(beam)
        if beam not in grid:
            pass
        elif grid[beam] == "^":
            splits += 1
            queue.append(addp(beam, Dir.W))
            queue.append(addp(beam, Dir.E))
        else:
            queue.append(beam)
    return splits


@cache
def count_timelines(grid: Grid, p: Point) -> int:
    if p not in grid:
        return 1
    if grid[p] == "^":
        left, right = addp(p, Dir.W), addp(p, Dir.E)
        return count_timelines(grid, left) + count_timelines(grid, right)
    return count_timelines(grid, addp(p, Dir.S))


if __name__ == "__main__":
    main(
        lambda s: count_splits(*parse(s)),
        lambda s: count_timelines(*parse(s)),
    )
