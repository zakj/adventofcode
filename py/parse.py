import re
from typing import Callable, TypeVar, overload

num_re = re.compile(r"[-+]?\d+")
T = TypeVar("T")


def all_numbers(s: str) -> list[int]:
    return [int(x) for x in num_re.findall(s)]


def first_number(s: str) -> int:
    match = num_re.search(s)
    if not match:
        raise ValueError("no numbers found")
    return int(match[0])


@overload
def paras(s: str, mapper: Callable[[str], T]) -> list[list[T]]:
    ...


@overload
def paras(s: str) -> list[list[str]]:
    ...


# TODO: This feels like excessive fighting with the type system...
def paras(
    s: str, mapper: Callable[[str], T] | None = None
) -> list[list[T]] | list[list[str]]:
    """Split a (multi-line) input string into a list of paragraphs.

    Each paragraph is a list of (single-line) strings, or the result of running
    `mapper` on each line.
    """
    if mapper is None:
        return [[x for x in para.splitlines()] for para in s.split("\n\n")]
    else:
        return [[mapper(x) for x in para.splitlines()] for para in s.split("\n\n")]
