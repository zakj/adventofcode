from typing import Iterable

from aoc import main
from aoc.coords import Grid, Point


def neighbors8(p: Point) -> Iterable[Point]:
    x, y = p
    return [
        (x, y - 1),
        (x + 1, y),
        (x, y + 1),
        (x - 1, y),
        (x - 1, y - 1),
        (x + 1, y - 1),
        (x - 1, y + 1),
        (x + 1, y + 1),
    ]


def part1(input: str):
    grid = Grid(input)
    accessible = 0
    for x in range(grid.width):
        for y in range(grid.height):
            if grid[x, y] != "@":
                continue
            rolls = 0
            for n in neighbors8((x, y)):
                if n in grid and grid[n] in ["x", "@"]:
                    rolls += 1
            if rolls < 4:
                grid[x, y] = "x"
                accessible += 1
    return accessible


def part2(input: str):
    grid = Grid(input)
    while True:
        found = False
        for x in range(grid.width):
            for y in range(grid.height):
                if grid[x, y] != "@":
                    continue
                rolls = 0
                for n in neighbors8((x, y)):
                    if n in grid and grid[n] in ["@"]:
                        rolls += 1
                if rolls < 4:
                    found = True
                    grid[x, y] = "x"
        if not found:
            break
    return len(grid.findall("x"))


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
