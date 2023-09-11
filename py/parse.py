import re
from typing import Callable, TypeVar

_identity = lambda x: x
num_re = re.compile(r"[-+]?\d+")
T = TypeVar("T")


def all_numbers(s: str) -> list[int]:
    return [int(x) for x in num_re.findall(s)]


def first_number(s: str) -> int:
    match = num_re.search(s)
    if not match:
        raise ValueError("no numbers found")
    return int(match[0])


def paras(s: str, mapper: Callable[[str], T] = _identity) -> list[list[T]]:
    """Split a (multi-line) input string into a list of paragraphs.

    Each paragraph is a list of (single-line) strings, or the result of running
    `mapper` on each line.
    """
    return [[mapper(x) for x in para.splitlines()] for para in s.split("\n\n")]
