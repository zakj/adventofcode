from collections.abc import Callable
from functools import cmp_to_key

from aoc import main
from parse import all_numbers, paras


def parse(s: str) -> tuple[Callable, list[list[int]]]:
    rules_str, pages_str = paras(s)
    rules = {tuple(all_numbers(line)) for line in rules_str}
    pages = [all_numbers(line) for line in pages_str]

    @cmp_to_key
    def compare(a: int, b: int) -> int:
        if (a, b) in rules:
            return -1
        if (b, a) in rules:
            return 1
        return 0

    return compare, pages


def sum_valid_middle_pages(s: str) -> int:
    key, updates = parse(s)
    updates = [(pages, sorted(pages, key=key)) for pages in updates]
    return sum([a[len(a) // 2] for a, b in updates if a == b])


def sum_corrected_invalid_pages(s: str) -> int:
    key, updates = parse(s)
    updates = [(pages, sorted(pages, key=key)) for pages in updates]
    return sum([b[len(b) // 2] for a, b in updates if a != b])


if __name__ == "__main__":
    main(sum_valid_middle_pages, sum_corrected_invalid_pages)
