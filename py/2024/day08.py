from itertools import combinations, permutations

from aoc import main
from aoc.coords import Grid, addp, subp


def parse(s: str) -> tuple[Grid, set[str]]:
    grid = Grid(s)
    antennas = set(grid.data.values()) - {"."}
    return grid, antennas


def count_antinodes(s: str) -> int:
    grid, antennas = parse(s)
    antinodes = set()
    for c in antennas:
        points = grid.findall(c)
        for a, b in combinations(points, 2):
            delta = subp(a, b)
            candidates = [addp(a, delta), subp(b, delta)]
            antinodes |= {p for p in candidates if p in grid}
    return len(antinodes)


def count_any_antinodes(s: str) -> int:
    grid, antennas = parse(s)
    antinodes = set()
    for c in antennas:
        points = grid.findall(c)
        for a, b in permutations(points, 2):
            delta = subp(a, b)
            candidates = set()
            cur = a
            while cur in grid:
                candidates.add(cur)
                cur = addp(cur, delta)
            antinodes |= candidates
    return len(antinodes)


if __name__ == "__main__":
    main(count_antinodes, count_any_antinodes)
