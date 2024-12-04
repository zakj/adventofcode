from aoc import main
from coords import Grid


def parse(s: str):
    pass


def part1(s: str) -> int:
    grid = Grid(s)
    # find every x, then go each direction
    count = 0
    for x in range(grid.width):
        for y in range(grid.height):
            if grid[x, y] == "X":
                if (
                    grid[x + 1, y] == "M"
                    and grid[x + 2, y] == "A"
                    and grid[x + 3, y] == "S"
                ):
                    count += 1
                if (
                    grid[x - 1, y] == "M"
                    and grid[x - 2, y] == "A"
                    and grid[x - 3, y] == "S"
                ):
                    count += 1
                if (
                    grid[x, y + 1] == "M"
                    and grid[x, y + 2] == "A"
                    and grid[x, y + 3] == "S"
                ):
                    count += 1
                if (
                    grid[x, y - 1] == "M"
                    and grid[x, y - 2] == "A"
                    and grid[x, y - 3] == "S"
                ):
                    count += 1

                if (
                    grid[x + 1, y + 1] == "M"
                    and grid[x + 2, y + 2] == "A"
                    and grid[x + 3, y + 3] == "S"
                ):
                    count += 1
                if (
                    grid[x - 1, y - 1] == "M"
                    and grid[x - 2, y - 2] == "A"
                    and grid[x - 3, y - 3] == "S"
                ):
                    count += 1
                if (
                    grid[x + 1, y - 1] == "M"
                    and grid[x + 2, y - 2] == "A"
                    and grid[x + 3, y - 3] == "S"
                ):
                    count += 1
                if (
                    grid[x - 1, y + 1] == "M"
                    and grid[x - 2, y + 2] == "A"
                    and grid[x - 3, y + 3] == "S"
                ):
                    count += 1
    return count


def part2(s: str) -> int:
    grid = Grid(s)
    # find every x, then go each direction
    count = 0
    for x in range(grid.width):
        for y in range(grid.height):
            if grid[x, y] == "A":
                corners = [
                    grid[x - 1, y - 1],
                    grid[x - 1, y + 1],
                    grid[x + 1, y + 1],
                    grid[x + 1, y - 1],
                ]
                if not all(c and c in "MS" for c in corners):
                    continue
                if corners[0] == corners[2]:
                    continue
                corners.sort()
                if "".join(corners) == "MMSS":
                    count += 1

    return count


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
