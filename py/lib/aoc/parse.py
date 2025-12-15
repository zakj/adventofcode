import functools
import re
from typing import Callable, TypeVar, overload

unsigned_num_re = re.compile(r"\d+")
num_re = re.compile(r"[-+]?\d+")
T = TypeVar("T")


def line_parser[T](fn: Callable[[str], T]) -> Callable[[str], list[T]]:
    @functools.wraps(fn)
    def wrapper(s: str, *args, **kwargs) -> list[T]:
        return [fn(line, *args, **kwargs) for line in s.splitlines()]

    return wrapper


def all_numbers(s: str, unsigned=False) -> list[int]:
    return [int(x) for x in (unsigned_num_re if unsigned else num_re).findall(s)]


def first_number(s: str, unsigned=False) -> int:
    match = (unsigned_num_re if unsigned else num_re).search(s)
    if not match:
        raise ValueError("no numbers found")
    return int(match[0])


@overload
def paras(s: str, mapper: Callable[[str], T]) -> list[list[T]]: ...


@overload
def paras(s: str) -> list[list[str]]: ...


# TODO: This feels like excessive fighting with the type system...
def paras(
    s: str, mapper: Callable[[str], T] | None = None
) -> list[list[T]] | list[list[str]]:
    """Split a (multi-line) input string into a list of paragraphs.

    Each paragraph is a list of (single-line) strings, or the result of running
    `mapper` on each line.
    """
    rv = [[x for x in para.splitlines()] for para in re.split(r"\n\n+", s)]
    if mapper:
        rv = [[mapper(line) for line in lines] for lines in rv]
    return rv
