from functools import cache

from aoc import main
from aoc.parse import all_numbers


@cache
def final_stones(stone: int, blinks: int) -> int:
    if blinks == 0:
        return 1
    blinks -= 1

    if stone == 0:
        return final_stones(1, blinks)
    elif len(str(stone)) % 2 == 0:
        string = str(stone)
        mid = len(string) // 2
        left, right = int(string[:mid]), int(string[mid:])
        return final_stones(left, blinks) + final_stones(right, blinks)
    else:
        return final_stones(stone * 2024, blinks)


def count_stones(s: str, blinks: int) -> int:
    stones = all_numbers(s)
    return sum(final_stones(stone, blinks) for stone in stones)


if __name__ == "__main__":
    main(
        lambda s: count_stones(s, 25),
        lambda s: count_stones(s, 75),
    )
