from itertools import combinations

from aoc import main
from coords import Point, mdist


def space(s: str) -> tuple[list[Point], list[int], list[int]]:
    lines = s.splitlines()
    galaxies = []
    for y, line in enumerate(lines):
        for x, c in enumerate(line):
            if c == "#":
                galaxies.append((x, y))

    gal_rows = set(y for _, y in galaxies)
    gal_cols = set(x for x, _ in galaxies)
    empty_rows = [r for r in range(len(lines)) if r not in gal_rows]
    empty_cols = [c for c in range(len(lines[0])) if c not in gal_cols]
    return galaxies, empty_rows, empty_cols


def galaxy_distance(s: str, expand: int) -> int:
    galaxies, empty_rows, empty_cols = space(s)

    expanded_galaxies = []
    expand -= 1
    for x, y in galaxies:
        left = len([c for c in empty_cols if c < x]) * expand
        top = len([r for r in empty_rows if r < y]) * expand
        expanded_galaxies.append((x + left, y + top))

    return sum(mdist(a, b) for a, b in combinations(expanded_galaxies, 2))


if __name__ == "__main__":
    main(
        lambda s: galaxy_distance(s, 2),
        lambda s, expand: galaxy_distance(s, expand),
    )
