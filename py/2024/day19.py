from collections import defaultdict
from functools import cache

from aoc import main
from aoc.parse import paras

# global because we don't want it in the caches
patterns = {}


def parse(s: str):
    patterns_str, designs = paras(s)
    global patterns
    patterns = defaultdict(list)
    for pattern in patterns_str[0].split(", "):
        patterns[pattern[0]].append(pattern)
    return designs


@cache
def is_valid(design: str) -> bool:
    if not design:
        return True
    for pattern in patterns[design[0]]:
        if design.startswith(pattern) and is_valid(design[len(pattern) :]):
            return True
    return False


def count_valid_designs(s: str) -> int:
    designs = parse(s)
    is_valid.cache_clear()
    return len([1 for p in designs if is_valid(p)])


@cache
def arrangements(design: str) -> int:
    if not design:
        return 1
    count = 0
    for pattern in patterns[design[0]]:
        if design.startswith(pattern):
            count += arrangements(design[len(pattern) :])
    return count


def count_all_arrangements(s: str) -> int:
    designs = parse(s)
    arrangements.cache_clear()
    return sum(arrangements(p) for p in designs)


if __name__ == "__main__":
    main(count_valid_designs, count_all_arrangements)
