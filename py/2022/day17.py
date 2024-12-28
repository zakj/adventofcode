from aoc import main
from aoc.coords import Dir, Grid, Point, Vector, addp, line_between

ROCKS = """
####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##
"""

type Rock = tuple[list[Point], int]


def parse(s: str) -> tuple[list[Vector], list[Rock]]:
    rocks = [Grid(rock).findall("#") for rock in ROCKS.strip().split("\n\n")]
    return (
        [Dir.parse(c) for c in s.replace("\n", "")],
        [(rock, max(y for _, y in rock) + 1) for rock in rocks],
    )


def move_rock(
    rock: list[Point], dir: Vector, filled: set[Point]
) -> tuple[list[Point], bool]:
    newpos = [addp(p, dir) for p in rock]
    if not all(0 <= p[0] <= 6 and p not in filled for p in newpos):
        return rock, False
    return newpos, True


def top_after(s: str, cycles: int) -> int:
    jets, rocks = parse(s)
    filled = set(line_between((0, 0), (6, 0)))
    highest_filled = 0
    jet_idx = 0
    seen = {}
    for i in range(cycles):
        rock_idx = i % len(rocks)

        key = rock_idx, jet_idx
        if key in seen:
            S, T = seen[key]
            d, m = divmod(cycles - i, i - S)
            if m == 0:
                highest_filled += (highest_filled - T) * d
                break
        seen[key] = i, highest_filled

        rock, rock_height = rocks[rock_idx]
        cur, moved = move_rock(rock, (2, highest_filled - rock_height - 3), filled)
        while moved:
            cur, moved = move_rock(cur, jets[jet_idx], filled)
            cur, moved = move_rock(cur, Dir.S, filled)
            jet_idx = (jet_idx + 1) % len(jets)
        filled |= set(cur)
        highest_filled = min([highest_filled] + [y for _, y in cur])
    return abs(highest_filled)


if __name__ == "__main__":
    main(
        lambda s: top_after(s, 2022),
        lambda s: top_after(s, 1000000000000),
    )
