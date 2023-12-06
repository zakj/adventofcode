from collections.abc import Callable
from math import prod

from aoc import main
from parse import all_numbers


def search(low: int, high: int, pred: Callable[[int], bool]) -> int:
    while low < high - 1:
        x = (low + high) // 2
        if pred(x):
            high = x
        else:
            low = x
    return high


def count_wins(time: int, distance: int) -> int:
    start_win = search(1, time, lambda x: x * (time - x) > distance)
    stop_win = search(start_win, time, lambda x: x * (time - x) <= distance)
    return stop_win - start_win


def score(s: str) -> int:
    return prod(
        count_wins(t, d)
        for t, d in zip(*[all_numbers(line) for line in s.splitlines()])
    )


if __name__ == "__main__":
    main(
        lambda s: score(s),
        lambda s: score(s.replace(" ", "")),
    )
