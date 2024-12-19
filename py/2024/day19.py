from collections import defaultdict
from functools import cache

from aoc import main
from parse import paras

# global because we don't want it in the caches
towels = {}


def parse(s: str):
    towels_str, patterns = paras(s)
    global towels
    towels = defaultdict(list)
    for towel in towels_str[0].split(", "):
        towels[towel[0]].append(towel)
    return patterns


@cache
def is_valid(pattern) -> bool:
    if not pattern:
        return True
    for towel in towels[pattern[0]]:
        if len(towel) <= len(pattern) and pattern.startswith(towel):
            if is_valid(pattern[len(towel) :]):
                return True
    return False


def count_valid_patterns(s: str) -> int:
    patterns = parse(s)
    is_valid.cache_clear()
    return len([1 for p in patterns if is_valid(p)])


@cache
def towel_options(pattern) -> int:
    if not pattern:
        return 1
    count = 0
    for towel in towels[pattern[0]]:
        if len(towel) <= len(pattern) and pattern.startswith(towel):
            count += towel_options(pattern[len(towel) :])
    return count


def count_configurations(s: str) -> int:
    patterns = parse(s)
    towel_options.cache_clear()
    return sum(towel_options(p) for p in patterns)


if __name__ == "__main__":
    main(count_valid_patterns, count_configurations)
