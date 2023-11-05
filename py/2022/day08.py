import numpy as np
from aoc import main


def parse(s: str) -> np.ndarray:
    return np.array([[int(c) for c in line] for line in s.splitlines()])


def visible_trees(grid: np.ndarray) -> np.ndarray:
    is_visible = np.zeros_like(grid)

    for _ in range(4):
        for x, y in np.ndindex(grid.shape):
            is_visible[x, y] |= all(grid[x, :y] < grid[x, y])
        grid = np.rot90(grid)
        is_visible = np.rot90(is_visible)

    return is_visible


def scenic_score(grid: np.ndarray) -> np.ndarray:
    score = np.ones_like(grid)

    for _ in range(4):
        for x, y in np.ndindex(grid.shape):
            (view,) = np.nonzero(grid[x, y + 1 :] >= grid[x, y])
            score[x, y] *= view[0] + 1 if view.size else len(grid[x, y + 1 :])
        grid = np.rot90(grid)
        score = np.rot90(score)

    return score


if __name__ == "__main__":
    main(
        lambda s: visible_trees(parse(s)).sum(),
        lambda s: scenic_score(parse(s)).max(),
    )
