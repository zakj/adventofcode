from functools import cache

from aoc import main
from parse import all_numbers


def is_valid(record: str, check: str) -> bool:
    # r = all(r == "?" or r == c for r, c in zip(record, check))
    # print(f"> {record=}, {check=}: {r}")
    assert len(record) == len(check)
    return all(r == "?" or r == c for r, c in zip(record, check))


def helper(record: str, groupings: list[int]) -> int:
    g = groupings[0]
    total = 0
    # for i in range(len(record) - sum(groupings[1:])):
    for i in range(len(record)):
        check = (i * ".") + (g * "#")
        if len(groupings) > 1:
            check += "."
        if len(check) > len(record):
            continue
        if is_valid(record[: len(check)], check):
            if len(groupings) == 1:
                if is_valid(record, check.ljust(len(record), ".")):
                    total += 1
            else:
                total += helper(record[len(check) :], groupings[1:])
    return total


def count_arrangements(line: str) -> int:
    record, grouping_str = line.split(" ")
    groupings = all_numbers(grouping_str)
    # for each grouping, generate a list of possible placements, and the remainder string. then recurse
    # instead, build a set of each possible arrangement given the groupings, then validate that they fit in the record
    return helper(record, groupings)


def part1(s: str) -> int:
    # if len(s) > 500:
    #     return 0
    # # print("-->", count_arrangements("?###???????? 3,2,1"))
    # print("-->", count_arrangements(".??..??...?##. 1,1,3"))
    return sum(count_arrangements(line) for line in s.splitlines())


@cache
def helper2(record: str, i: int, groupings: tuple[int], groupi: int) -> int:
    """
    record: the full template line
    i: our current index into the record
    groupings: remaining unallocated groups of #
    groupi: our current index into the first grouping
    """

    if i >= len(record):
        if not groupings:
            return 1
        if len(groupings) == 1 and groupi == groupings[0]:
            return 1
        return 0

    count = 0
    if record[i] in "#?" and groupings:
        # continue a current group, or start a new group
        if groupi < groupings[0]:
            count += helper2(record, i + 1, groupings, groupi + 1)
    if record[i] in ".?":
        # continue with a dot, consume a group if we completed it
        if groupi == 0:
            count += helper2(record, i + 1, groupings, 0)
        if groupings and groupi == groupings[0]:
            count += helper2(record, i + 1, groupings[1:], 0)
    return count


def part2(s: str) -> int:
    total = 0
    lines = len(s.splitlines())
    for i, line in enumerate(s.splitlines()):
        if i % 100 == 0:
            print(i, "of", lines)
        a, b = line.split(" ")
        b = all_numbers(b)
        record = "?".join([a] * 5)
        groups = b * 5
        rv = helper2(record, 0, tuple(groups), 0)
        # print(record, groups, "-", rv)
        total += rv
        # print(line)
        # print(" ".join([a, b]))
        # return 0
        # total += helper2(" ".join([a, b]))
    return total


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
