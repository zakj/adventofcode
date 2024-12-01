from collections import Counter

from aoc import main
from parse import all_numbers


def parse(s: str) -> tuple[list[int], list[int]]:
    left: list[int] = []
    right: list[int] = []
    for line in s.splitlines():
        a, b = all_numbers(line)
        left.append(a)
        right.append(b)
    return left, right


def total_distance(s: str) -> int:
    left, right = parse(s)
    left.sort()
    right.sort()
    return sum(abs(a - b) for a, b in zip(left, right))


def similarity_score(s: str) -> int:
    left, right = parse(s)
    right_count = Counter(right)
    return sum(a * right_count[a] for a in left)


if __name__ == "__main__":
    main(total_distance, similarity_score)
