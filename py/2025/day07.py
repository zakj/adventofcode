from functools import cache

from aoc import main
from aoc.coords import Dir, Grid, Point, addp


def parse(input: str) -> tuple[Grid, Point]:
    grid = Grid(input)
    return grid, grid.find("S")


def count_splits(grid: Grid, start: Point) -> int:
    seen_beams = {start}
    beams = {start}
    splits = 0
    while beams:
        beam = beams.pop()
        beam = addp(beam, Dir.S)
        if beam in seen_beams:
            continue
        seen_beams.add(beam)
        if beam not in grid:
            continue
        elif grid[beam] == ".":
            beams.add(beam)
        elif grid[beam] == "^":
            splits += 1
            beams.add(addp(beam, Dir.W))
            beams.add(addp(beam, Dir.E))
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
