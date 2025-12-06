import collections
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from itertools import islice
from pathlib import Path
from typing import Iterable, Iterator, Literal

from aoc.parse import paras


def chunks[T](xs: list[T], n: int) -> list[list[T]]:
    """Split xs into sublists of length n."""
    return [xs[i : i + n] for i in range(0, len(xs), n)]


# From itertools recipes
def sliding_window[T](iterable: Iterable[T], n: int) -> Iterable[Iterable[T]]:
    # sliding_window('ABCDEFG', 4) --> ABCD BCDE CDEF DEFG
    it = iter(iterable)
    window = collections.deque(islice(it, n), maxlen=n)
    if len(window) == n:
        yield tuple(window)
    for x in it:
        window.append(x)
        yield tuple(window)


def takeuntil[T](predicate: Callable[[T], bool], iterable: Iterable[T]) -> Iterable[T]:
    for x in iterable:
        yield x
        if predicate(x):
            return


def mod(x: int, mod: int, min: int = 0) -> int:
    """x % mod, but shifted to account for a min value. Handles negatives."""
    n = mod - min
    return (x + n - min) % n + min


def rotate_cw(lines: Sequence[str]) -> list[str]:
    return ["".join(x).strip() for x in zip(*reversed(lines))]


def rotate_ccw(lines: Sequence[str]) -> list[str]:
    return list(reversed(["".join(x).strip() for x in zip(*lines)]))


def flip_rows_cols(lines: Sequence[str]) -> list[str]:
    return ["".join(x).strip() for x in zip(*lines)]


# To make a class (vs its instance) iterable, used by coords.Dir.
class IterableClass[T](type):
    def classiter(self):
        raise NotImplementedError

    def __iter__(self) -> Iterator[T]:
        return self.classiter()


@dataclass(eq=True)
class Range:
    start: int
    end: int

    @classmethod
    def from_str(cls, s: str) -> "Range":
        start, end = s.split("-")
        return Range(int(start), int(end))

    @staticmethod
    def union(*ranges: "Range") -> "list[Range]":
        if not ranges:
            return []
        first, *sorted_ranges = sorted(ranges)
        union = [Range(first.start, first.end)]
        for cur in sorted_ranges:
            try:
                union[-1] |= cur
            except ValueError:
                union.append(Range(cur.start, cur.end))
        return union

    def __lt__(self, other: "Range") -> bool:
        return self.start < other.start

    def __len__(self) -> int:
        return self.end - self.start + 1

    def __contains__(self, other: int) -> bool:
        return self.start <= other <= self.end

    def __or__(self, other: "Range") -> "Range":
        if not (self.start <= other.end + 1 and other.start <= self.end + 1):
            raise ValueError("ranges must overlap or be adjacent")
        return Range(min(self.start, other.start), max(self.end, other.end))

    def overlaps(self, other: "Range") -> bool:
        return self.start <= other.end and other.start <= self.end


def ocr(lines: list[str], font: Literal["4x6"] | Literal["6x10"]) -> str:
    # TODO: relocate these
    path = Path(__file__).parent / f"figlet-{font}.txt"
    with open(path) as f:
        values, *keys = paras(f.read())
    values = values[0]
    width = len(keys[0][0])
    keys = ["".join(letter) for letter in keys]
    assert len(values) == len(keys)
    mapping = {k: v for k, v in zip(keys, values)}
    chars = []
    for i in range(0, len(lines[0]), width):
        chars.append(mapping["".join(l[i : i + width] for l in lines)])
    return "".join(chars)
