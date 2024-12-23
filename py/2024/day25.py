from itertools import combinations

from aoc import main
from coords import Grid


def unique_lock_key_pairs(s: str) -> int:
    grids = []
    for grid_str in s.split("\n\n"):
        grids.append(set(Grid(grid_str).findall("#")))
    return len([1 for a, b in combinations(grids, 2) if len(a & b) == 0])


if __name__ == "__main__":
    main(unique_lock_key_pairs)
