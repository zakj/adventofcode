from aoc import main
from parse import all_numbers, paras


def parse(s: str) -> tuple[list[tuple[int, int]], list[list[int]]]:
    rules_str, pages_str = paras(s)
    rules = []
    for line in rules_str:
        a, b = all_numbers(line)
        rules.append((a, b))
    pages = []
    for line in pages_str:
        pages.append(all_numbers(line))
    return rules, pages


def is_valid(pages, rules):
    for i in range(len(pages)):
        p = pages[i]
        afters = {b for a, b in rules if a == p}
        for j in range(i):
            if pages[j] in afters:
                return False
        befores = {a for a, b in rules if b == p}
        for j in range(i, len(pages)):
            if pages[j] in befores:
                return False
    return True


def invalid_at(pages, rules) -> tuple[int, int]:
    for i in range(len(pages)):
        p = pages[i]
        afters = {b for a, b in rules if a == p}
        for j in range(i):
            if pages[j] in afters:
                return i, j
        befores = {a for a, b in rules if b == p}
        for j in range(i, len(pages)):
            if pages[j] in befores:
                return i, j
    raise


def part1(s: str) -> int:
    rules, updates = parse(s)
    valid = []
    for pages in updates:
        if is_valid(pages, rules):
            valid.append(pages)

    total = 0
    for pages in valid:
        total += pages[len(pages) // 2]

    return total


def part2(s: str) -> int:
    rules, updates = parse(s)
    invalid = []
    for pages in updates:
        if not is_valid(pages, rules):
            invalid.append(pages)

    for pages in invalid:
        while not is_valid(pages, rules):
            i, j = invalid_at(pages, rules)
            pages[i], pages[j] = pages[j], pages[i]

    total = 0
    for pages in invalid:
        total += pages[len(pages) // 2]

    return total


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
