from collections import defaultdict

from aoc import main, progress
from parse import all_numbers
from util import sliding_window

PRUNE = 16777216


def next_secret(n: int) -> int:
    n ^= n * 64
    n %= PRUNE
    n ^= n // 32
    n %= PRUNE
    n ^= n * 2048
    n %= PRUNE
    return n


def part1(s: str) -> int:
    initial_secrets = all_numbers(s)
    total = 0
    for n in initial_secrets:
        for i in range(2000):
            n = next_secret(n)
        total += n
    return total


def part2(s: str) -> int:
    initial_secrets = all_numbers(s)

    running_total = defaultdict(int)
    for n in progress(initial_secrets):
        values = [n % 10]
        changes: list[int] = []
        for i in range(2000):
            n = next_secret(n)
            d = n % 10
            changes.append(d - values[-1])
            values.append(n % 10)

        seen = set()
        for i, sequence in enumerate(sliding_window(changes, 4)):
            if sequence not in seen:
                running_total[sequence] += values[i + 4]
                seen.add(sequence)

    return max(running_total.values())


# TODO: cleanup
if __name__ == "__main__":
    main(
        part1,
        part2,
    )
