from itertools import combinations, takewhile

from aoc import main
from coords import Point, mdist


def space(s: str) -> tuple[list[Point], list[int], list[int]]:
    lines = s.splitlines()
    galaxies = []
    empty_rows = []
    empty_cols = []

    for y, line in enumerate(lines):
        if "#" not in line:
            empty_rows.append(y)
        else:
            for x, c in enumerate(line):
                if c == "#":
                    galaxies.append((x, y))

    rotated = ["".join(x).strip() for x in zip(*reversed(lines))]
    for i, col in enumerate(rotated):
        if "#" not in col:
            empty_cols.append(i)

    return galaxies, empty_rows, empty_cols


def galaxy_distance(s: str, expand: int) -> int:
    galaxies, empty_rows, empty_cols = space(s)

    expanded_galaxies = []
    for x, y in galaxies:
        left = len(list(takewhile(lambda c: c < x, empty_cols)))
        top = len(list(takewhile(lambda r: r < y, empty_rows)))
        expanded_galaxies.append((x + left * (expand - 1), y + top * (expand - 1)))

    return sum(mdist(a, b) for a, b in combinations(expanded_galaxies, 2))


if __name__ == "__main__":
    main(
        lambda s: galaxy_distance(s, 2),
        lambda s, expand: galaxy_distance(s, expand),
    )
