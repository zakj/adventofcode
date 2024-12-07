from functools import reduce
from itertools import product
from operator import add, mul

from aoc import main
from parse import all_numbers


def all_combs(gaps: int):
    rv = []
    for i in range(2**gaps):
        cur = [mul] * gaps
        # print(f"{i=}")
        for j in range(gaps):
            # print(f"{j=}")
            if i & 2**j:
                # print(f"{i & 2**j=}")
                cur[j] = add
        rv.append(cur)
    return rv


def part1(s: str) -> int:
    ops = [add, mul]
    sum = 0
    for line in s.splitlines():
        target, *values = all_numbers(line)
        gaps = len(values) - 1
        combs = all_combs(gaps)
        for ops in combs:
            ops = list(ops)
            total = reduce(lambda acc, x: ops.pop()(acc, x), values)
            if total == target:
                sum += target
                break

    return sum


def concat(a: int, b: int) -> int:
    return int(f"{a}{b}")


def all_combs2(gaps: int):
    return product([add, mul, concat], repeat=gaps)


def part2(s: str) -> int:
    ops = [add, mul]
    sum = 0
    for line in s.splitlines():
        target, *values = all_numbers(line)
        gaps = len(values) - 1
        combs = all_combs2(gaps)
        for ops in combs:
            ops = list(ops)
            total = reduce(lambda acc, x: ops.pop()(acc, x), values)
            if total == target:
                sum += target
                break
    return sum


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
