from aoc import main
from aoc.coords import Grid, Point, neighbors8


def accessible_rolls(grid: Grid) -> list[Point]:
    rolls = []
    for p in grid.findall("@"):
        neighbor_rolls = sum(1 for n in neighbors8(p) if n in grid and grid[n] == "@")
        if neighbor_rolls < 4:
            rolls.append(p)
    return rolls


def removable_rolls(grid: Grid):
    while True:
        to_remove = accessible_rolls(grid)
        if not to_remove:
            break
        for p in to_remove:
            grid[p] = "x"
    return grid.findall("x")


if __name__ == "__main__":
    main(
        lambda s: len(accessible_rolls(Grid(s))),
        lambda s: len(removable_rolls(Grid(s))),
    )
