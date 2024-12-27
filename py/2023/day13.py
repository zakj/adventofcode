from collections.abc import Sequence

from aoc import main
from aoc.parse import paras
from aoc.util import flip_rows_cols


def find_mirror(lines: Sequence[str], smudges: int) -> int:
    for i in range(1, len(lines[0])):
        diffs = 0
        for line in lines:
            diffs += sum(1 for a, b in zip(line[i - 1 :: -1], line[i:]) if a != b)
            if diffs > smudges:
                break
        if diffs == smudges:
            return i
    return 0


def summarize(patterns: list[list[str]], smudges=0) -> int:
    total = 0
    for map in patterns:
        match = find_mirror(map, smudges)
        total += match
        if not match:
            total += find_mirror(flip_rows_cols(map), smudges) * 100
    return total


if __name__ == "__main__":
    main(
        lambda s: summarize(paras(s)),
        lambda s: summarize(paras(s), smudges=1),
    )
