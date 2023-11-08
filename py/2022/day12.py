import collections

import numpy as np
from aoc import main


def parse(s: str):
    return np.array([list(line) for line in s.splitlines()])


map_height = np.vectorize(lambda c: ord({"S": "a", "E": "z"}.get(c, c)))
adjacent = [np.array(p) for p in ((0, 1), (0, -1), (1, 0), (-1, 0))]


def shortest(grid: np.ndarray, goal: str) -> int:
    start = tuple(*np.argwhere(grid == "E"))
    heights: np.ndarray = map_height(grid)

    q: collections.deque[tuple[tuple, int]] = collections.deque([(start, 0)])
    visited = {start}
    while q:
        cur, distance = q.popleft()
        if grid[cur] in goal:  # type: ignore
            return distance
        for move in (tuple(cur + dir) for dir in adjacent):
            if any(m >= g or m < 0 for m, g in zip(move, grid.shape)):
                continue
            if move in visited or heights[cur] - heights[move] > 1:
                continue
            q.append((move, distance + 1))
            visited.add(move)
    raise Exception


if __name__ == "__main__":
    main(
        lambda s: shortest(parse(s), "S"),
        lambda s: shortest(parse(s), "Sa"),
    )
