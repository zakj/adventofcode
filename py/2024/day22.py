from collections import defaultdict
from itertools import pairwise

from aoc import main, progress
from parse import all_numbers
from util import sliding_window


def next_secret(n: int) -> int:
    n = (n ^ (n * 64)) % 0x1000000
    n = n ^ (n // 32)  # prune here is a no-op
    return (n ^ (n * 2048)) % 0x1000000


def sum_of_secrets(s: str) -> int:
    total = 0
    for n in all_numbers(s):
        for i in range(2000):
            n = next_secret(n)
        total += n
    return total


def best_sequence_of_changes(s: str) -> int:
    running_total = defaultdict(int)
    for n in progress(all_numbers(s)):
        values = [n % 10]
        for i in range(2000):
            n = next_secret(n)
            values.append(n % 10)
        changes = [a - b for a, b in pairwise(values)]
        seen = set()
        for i, sequence in enumerate(sliding_window(changes, 4)):
            if sequence not in seen:
                running_total[sequence] += values[i + 4]
                seen.add(sequence)
    return max(running_total.values())


if __name__ == "__main__":
    main(sum_of_secrets, best_sequence_of_changes)
