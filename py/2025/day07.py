from functools import cache

from aoc import main
from aoc.coords import Dir, Grid, Point, addp


def part1(input: str):
    grid = Grid(input)
    start = grid.find("S")
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
def paths_to_end(grid: Grid, p: Point) -> int:
    if p not in grid:
        return 1
    if grid[p] in ["S", "."]:
        return paths_to_end(grid, addp(p, Dir.S))
    if grid[p] == "^":
        return paths_to_end(grid, addp(p, Dir.W)) + paths_to_end(grid, addp(p, Dir.E))
    raise ValueError


def part2(input: str):
    grid = Grid(input)
    start = grid.find("S")
    return paths_to_end(grid, start)


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
