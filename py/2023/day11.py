from itertools import combinations

from aoc import main
from coords import mdist
from graph import Graph


def part1(s: str) -> int:
    inlines = s.splitlines()
    outlines = []
    for line in inlines:
        outlines.append(list(line))
        if "#" not in line:
            outlines.append(list(line))
    cols = []
    for x in range(len(outlines[0])):
        if any(line[x] == "#" for line in outlines):
            continue
        cols.append(x)
    print(f"{cols=}")
    for col in reversed(cols):
        for line in outlines:
            line.insert(col, ".")
    expanded = "\n".join(list("".join(line) for line in outlines))
    G = Graph.from_grid(expanded, lambda a, b, c, d: True)
    galaxies = [n for n, d in G.nodes.items() if d["label"] == "#"]

    tot = 0
    for a, b in combinations(galaxies, 2):
        tot += mdist(a, b)
    return tot


def part2(s: str) -> int:
    G = Graph.from_grid(s, lambda a, b, c, d: True)
    galaxies = [n for n, d in G.nodes.items() if d["label"] == "#"]

    lines = s.splitlines()
    empty_rows = []
    empty_cols = []
    for i, row in enumerate(lines):
        if "#" not in row:
            empty_rows.append(i)
    rotated = ["".join(x).strip() for x in zip(*reversed(lines))]
    for i, col in enumerate(rotated):
        if "#" not in col:
            empty_cols.append(i)
    print(f"{empty_rows=}")
    print(f"{empty_cols=}")

    from itertools import takewhile

    expanded_galaxies = []
    exp = 1000000
    # exp = 100
    for x, y in galaxies:
        left = len(list(takewhile(lambda c: c < x, empty_cols)))
        top = len(list(takewhile(lambda r: r < y, empty_rows)))
        expanded_galaxies.append((x + left * (exp - 1), y + top * (exp - 1)))

    tot = 0
    for a, b in combinations(expanded_galaxies, 2):
        tot += mdist(a, b)
    return tot


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
