from aoc import main
from util import sliding_window


def first_marker(buffer: str, size: int = 4) -> int:
    for i, window in enumerate(sliding_window(buffer, size), start=size):
        if len(set(window)) == size:
            return i
    raise ValueError("no marker found")


if __name__ == "__main__":
    main(
        lambda s: first_marker(s),
        lambda s: first_marker(s, 14),
    )
