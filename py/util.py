import collections
from collections.abc import Sequence
from itertools import islice
from typing import Generic, Iterable, Iterator, TypeVar

T = TypeVar("T")


def chunks(xs: list[T], n: int) -> list[list[T]]:
    """Split xs into sublists of length n."""
    return [xs[i : i + n] for i in range(0, len(xs), n)]


chunk = lambda x, n: zip(*[iter(x)] * n)


# From itertools recipes
def sliding_window(iterable: Iterable[T], n: int) -> Iterable[Iterable[T]]:
    # sliding_window('ABCDEFG', 4) --> ABCD BCDE CDEF DEFG
    it = iter(iterable)
    window = collections.deque(islice(it, n), maxlen=n)
    if len(window) == n:
        yield tuple(window)
    for x in it:
        window.append(x)
        yield tuple(window)


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
class IterableClass(type, Generic[T]):
    def classiter(self):
        raise NotImplementedError

    def __iter__(self) -> Iterator[T]:
        return self.classiter()
