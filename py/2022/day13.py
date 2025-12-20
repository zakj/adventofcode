import functools as ft
import itertools as it
import json

from aoc import main
from aoc.parse import paras


def parse(s: str):
    return [(a, b) for a, b in paras(s, json.loads)]


def cmp(a, b):
    if isinstance(a, int) and isinstance(b, int):
        return a - b
    if isinstance(a, int):
        a = [a]
    elif isinstance(b, int):
        b = [b]
    for i in range(min(len(a), len(b))):
        r = cmp(a[i], b[i])
        if r != 0:
            return r
    return len(a) - len(b)


def ordered_indexes(pairs):
    return sum(i + 1 for i, valid in enumerate(cmp(a, b) < 1 for a, b in pairs) if valid)


def decoder_key(pairs):
    dividers = [[[2]], [[6]]]
    packets = list(it.chain(dividers, *pairs))
    packets.sort(key=ft.cmp_to_key(cmp))
    return (packets.index(dividers[0]) + 1) * (packets.index(dividers[1]) + 1)


if __name__ == "__main__":
    main(
        lambda s: ordered_indexes(parse(s)),
        lambda s: decoder_key(parse(s)),
    )
