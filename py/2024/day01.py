from aoc import main
from parse import all_numbers
from collections import Counter

def part1(s: str):
    left, right = [], []
    for line in s.splitlines():
        a, b = all_numbers(line)
        left.append(a)
        right.append(b)
    distance = 0
    left.sort()
    right.sort()
    for a, b in zip(left, right):
        distance += abs(a - b)
    return distance

def part2(s: str):
    left, right = [], []
    for line in s.splitlines():
        a, b = all_numbers(line)
        left.append(a)
        right.append(b)

    right_count = Counter(right)
    total = 0
    for a in left:
        total += a * right_count[a]

    return total

if __name__ == "__main__":
    main(
        part1,
        part2,
    )
