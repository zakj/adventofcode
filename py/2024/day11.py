from functools import cache

from aoc import main
from parse import all_numbers


@cache
def rec(stone: int, remain: int) -> int:
    if remain == 0:
        return 1
    remain -= 1
    if stone == 0:
        return rec(1, remain)
    elif len(str(stone)) % 2 == 0:
        ss = str(stone)
        return rec(int(ss[: len(ss) // 2]), remain) + rec(
            int(ss[len(ss) // 2 :]), remain
        )
    else:
        return rec(stone * 2024, remain)


def part1(s: str) -> int:
    stones = all_numbers(s)
    count = 0
    for stone in stones:
        count += rec(stone, 25)
    return count


def part2(s: str) -> int:
    stones = all_numbers(s)
    count = 0
    for stone in stones:
        count += rec(stone, 75)
    return count


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
