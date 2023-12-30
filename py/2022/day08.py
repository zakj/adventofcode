from collections.abc import Iterable

from aoc import main
from coords import Grid
from util import takeuntil


def ranges(grid: Grid[int], x: int, y: int) -> tuple[Iterable[int], ...]:
    return (
        (grid[x, yy] for yy in reversed(range(0, y))),
        (grid[x, yy] for yy in range(y + 1, grid.height)),
        (grid[xx, y] for xx in reversed(range(0, x))),
        (grid[xx, y] for xx in range(x + 1, grid.width)),
    )


def visible_trees(s: str) -> int:
    grid = Grid(s, int)
    count = 0
    for (x, y), val in grid.data.items():
        if any([all(other < val for other in vals) for vals in ranges(grid, x, y)]):
            count += 1
    return count


def scenic_score(s: str) -> int:
    grid = Grid(s, int)
    scores = []

    for (x, y), val in grid.data.items():
        score = 1
        for vals in ranges(grid, x, y):
            score *= len(list(takeuntil((lambda other: other >= val), vals)))
        scores.append(score)

    return max(scores)


if __name__ == "__main__":
    main(
        lambda s: visible_trees(s),
        lambda s: scenic_score(s),
    )
