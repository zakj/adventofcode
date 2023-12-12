from functools import lru_cache

from aoc import main
from parse import all_numbers


@lru_cache(maxsize=512)
def _arrangements(record: str, i: int, groupings: tuple[int], groupi: int) -> int:
    """
    record: the full template line
    i: our current index into the record
    groupings: remaining unallocated groups of #
    groupi: our current index into the first grouping
    """

    if i >= len(record):
        if not groupings:
            # completed all groups
            return 1
        if len(groupings) == 1 and groupi == groupings[0]:
            # completed the last group on the last character
            return 1
        # finished the record with unfinished groups
        return 0

    count = 0
    if record[i] in "#?" and groupings and groupi < groupings[0]:
        # continue a current group, or start a new group
        count += _arrangements(record, i + 1, groupings, groupi + 1)
    if record[i] in ".?" and groupi == 0:
        # continue with a series of dots
        count += _arrangements(record, i + 1, groupings, 0)
    if record[i] in ".?" and groupings and groupi == groupings[0]:
        # consume a group and start a series of dots
        count += _arrangements(record, i + 1, groupings[1:], 0)
    return count


def arrangements(line: str, unfold=False) -> int:
    a, b = line.split(" ")
    b = all_numbers(b)
    if unfold:
        a = "?".join([a] * 5)
        b = b * 5
    return _arrangements(a, 0, tuple(b), 0)


if __name__ == "__main__":
    main(
        lambda s: sum(arrangements(line) for line in s.splitlines()),
        lambda s: sum(arrangements(line, True) for line in s.splitlines()),
    )
