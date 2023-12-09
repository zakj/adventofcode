from collections.abc import Generator

from aoc import main
from parse import all_numbers

History = list[list[int]]


def histories(s: str) -> Generator[History, None, None]:
    for line in s.splitlines():
        history = [all_numbers(line)]
        while any(n != 0 for n in history[-1]):
            diffs = []
            prev = history[-1][0]
            for n in history[-1][1:]:
                diffs.append(n - prev)
                prev = n
            history.append(diffs)
        yield history


def next_val(history: History) -> int:
    return sum([diffs[-1] for diffs in history])


def prev_val(history: History) -> int:
    prev = history[-1][0]
    for diffs in reversed(history[:-1]):
        prev = diffs[0] - prev
    return prev


if __name__ == "__main__":
    main(
        lambda s: sum(next_val(h) for h in histories(s)),
        lambda s: sum(prev_val(h) for h in histories(s)),
    )
