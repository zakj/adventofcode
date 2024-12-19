from collections import defaultdict

from aoc import main, status
from parse import paras


def parse(s: str):
    pass


from functools import cache

towels_dict = {}


@cache
def is_valid(pattern) -> bool:
    if not pattern:
        return True
    for towel in towels_dict[pattern[0]]:
        if len(towel) <= len(pattern) and pattern.startswith(towel):
            if is_valid(pattern[len(towel) :]):
                return True
    return False


def part1(s: str) -> int:
    global towels_dict
    lines = s.splitlines()
    towels = lines[0].split(", ")
    towels.sort(key=lambda t: len(t))
    towels.reverse()
    towels_dict = defaultdict(list)
    is_valid.cache_clear()
    for towel in towels:
        towels_dict[towel[0]].append(towel)
    patterns = lines[2:]
    return len([1 for p in patterns if is_valid(p)])


@cache
def towel_options(pattern) -> int:
    if not pattern:
        return 1

    count = 0
    for towel in towels_dict[pattern[0]]:
        if len(towel) <= len(pattern) and pattern.startswith(towel):
            sub = pattern[len(towel) :]
            if is_valid(sub):
                count += towel_options(sub)
    return count


def part2(s: str) -> int:
    global towels_dict
    lines = s.splitlines()
    towels = lines[0].split(", ")
    towels.sort(key=lambda t: len(t))
    towels.reverse()
    towels_dict = defaultdict(list)
    is_valid.cache_clear()
    towel_options.cache_clear()
    for towel in towels:
        towels_dict[towel[0]].append(towel)
    patterns = lines[2:]
    return sum(towel_options(p) for p in patterns)


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
