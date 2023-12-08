import re
from collections import defaultdict
from functools import reduce
from typing import Callable, NamedTuple

from aoc import main
from parse import all_numbers, paras
from util import chunks


class Map(NamedTuple):
    dst: int
    src: int
    size: int


def parse(s: str) -> tuple[list[int], list[list[Map]]]:
    chunks = paras(s)
    seeds = all_numbers(chunks.pop(0)[0])

    path = {}
    maps: dict[str, list[Map]] = defaultdict(list)
    for chunk in chunks:
        [src, dst, *_] = re.split(r"-to-| ", chunk.pop(0))
        path[src] = dst
        for line in chunk:
            maps[src].append(Map(*all_numbers(line)))

    src = "seed"
    nmaps: list[list[Map]] = []
    while src != "location":
        nmaps.append(maps[src])
        src = path[src]

    return seeds, nmaps


def next_category(src_ranges, maps: list[Map]):
    dst_ranges = []
    for start, start_range in src_ranges:
        while start_range > 0:
            for dst, src, size in maps:
                if src <= start < src + size:
                    size -= max(start - src, size - start_range)
                    dst_ranges.append((start - src + dst, size))
                    start += size
                    start_range -= size
                    break
            else:
                dst_ranges.append((start, start_range))
                break
    return dst_ranges


def lowest_location(
    seeds: list[int], almanac: list[list[Map]], seed_fn: Callable
) -> int:
    return min(reduce(next_category, almanac, seed_fn(seeds)))[0]


if __name__ == "__main__":
    main(
        lambda s: lowest_location(*parse(s), lambda seeds: [(s, 1) for s in seeds]),
        lambda s: lowest_location(*parse(s), lambda seeds: chunks(seeds, 2)),
    )
