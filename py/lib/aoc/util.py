import collections
import math
from collections.abc import Callable, Generator, Iterable, Iterator, Sequence
from contextlib import contextmanager
from datetime import timedelta
from itertools import islice
from pathlib import Path
from time import perf_counter
from typing import Literal

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


def ndigits(n: int) -> int:
    return math.floor(math.log10(n)) + 1


def mod_range(x: int, lower: int, upper: int) -> int:
    """x % mod, but to be within [lower, upper). Handles negatives."""
    n = upper - lower
    return (x + n - lower) % n + lower


def rotate_cw(lines: Sequence[str]) -> list[str]:
    return ["".join(x).strip() for x in zip(*reversed(lines))]


def rotate_ccw(lines: Sequence[str]) -> list[str]:
    return list(reversed(["".join(x).strip() for x in zip(*lines)]))


def flip_rows_cols(lines: Sequence[str]) -> list[str]:
    return ["".join(x).strip() for x in zip(*lines)]


@contextmanager
def perf(label: str = "") -> Generator[None]:
    start = perf_counter()
    yield
    print(timedelta(seconds=perf_counter() - start), label)


# To make a class (vs its instance) iterable, used by coords.Dir.
class IterableClass[T](type):
    def classiter(self):
        raise NotImplementedError

    def __iter__(self) -> Iterator[T]:
        return self.classiter()


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
