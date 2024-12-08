from itertools import combinations

from aoc import main
from coords import Grid, addp, subp


def parse(s: str):
    pass


# count antinodes within the map. in line with two matching chars, equidistant
def part1(s: str) -> int:
    grid = Grid(s)
    antennas = {c for c in grid.data.values() if c != "."}
    antinodes = set()
    for c in antennas:
        points = grid.findall(c)
        for a, b in combinations(points, 2):
            delta = subp(a, b)
            candidates = [addp(a, delta), subp(b, delta)]
            antinodes |= {p for p in candidates if p in grid}
    return len(antinodes)


def part2(s: str) -> int:
    grid = Grid(s)
    antennas = {c for c in grid.data.values() if c != "."}
    antinodes = set()
    for c in antennas:
        points = grid.findall(c)
        for a, b in combinations(points, 2):
            delta = subp(a, b)
            candidates = [a, b]
            cur = addp(a, delta)
            while cur in grid:
                candidates.append(cur)
                cur = addp(cur, delta)
            cur = subp(a, delta)
            while cur in grid:
                candidates.append(cur)
                cur = subp(cur, delta)
            antinodes |= {p for p in candidates if p in grid}
    return len(antinodes)


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
