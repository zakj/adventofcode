from aoc import main
from util import chunks


def priority(c: str) -> int:
    lower_base = ord("a") - 1
    upper_base = ord("A") - 27
    return ord(c) - (lower_base if c.islower() else upper_base)


def duplicated(bag: str) -> str:
    mid = len(bag) // 2
    a, b = set(bag[:mid]), set(bag[mid:])
    return next(iter(a & b))


def badge(bags: list[str]) -> str:
    return next(iter(set.intersection(*[set(bag) for bag in bags])))


if __name__ == "__main__":
    main(
        lambda s: sum(priority(duplicated(bag)) for bag in s.splitlines()),
        lambda s: sum(priority(badge(group)) for group in chunks(s.splitlines(), 3)),
    )
