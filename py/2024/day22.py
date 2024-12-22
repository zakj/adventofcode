from collections import defaultdict

from aoc import main, progress
from parse import all_numbers
from util import sliding_window

PRUNE = 16777216


def parse(s: str):
    pass


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

    sequence_maps = []
    all_sequences = set()
    print(f"{len(initial_secrets)=}")
    for n in progress(initial_secrets):
        values = [n % 10]
        changes: list[int] = []
        for i in range(2000):
            n = next_secret(n)
            d = n % 10
            changes.append(d - values[-1])
            values.append(n % 10)

        sequence_map = defaultdict(int)
        for i, sequence in enumerate(sliding_window(changes, 4)):
            all_sequences.add(sequence)
            # WHOOPS
            # sequence_map[sequence] = max(sequence_map[sequence], (values[i + 4]))
            if sequence not in sequence_map:
                sequence_map[sequence] = values[i + 4]
        sequence_maps.append(sequence_map)

    best = 0
    print(f"{len(all_sequences)}")
    print(f"{len(sequence_maps)}")
    for sequence in progress(all_sequences):
        val = sum(sm[sequence] for sm in sequence_maps)
        if val > best:
            print(sequence, val)
            best = val
    return best


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=1,
    )
