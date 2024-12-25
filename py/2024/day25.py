from itertools import product

from aoc import main
from coords import Grid


def unique_lock_key_pairs(s: str) -> int:
    keys, locks = [], []
    for grid_str in s.split("\n\n"):
        grid = Grid(grid_str)
        hashes = set(grid.findall("#"))
        (locks if grid[0, 0] == "#" else keys).append(hashes)
    return len([1 for a, b in product(keys, locks) if len(a & b) == 0])


if __name__ == "__main__":
    main(unique_lock_key_pairs)
