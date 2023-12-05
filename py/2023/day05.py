import re
from itertools import count, islice

from aoc import main
from parse import all_numbers, paras


def find_value_rev(dst: int, maps):
    for dst_start, src_start, size in maps:
        if dst >= dst_start and dst < dst_start + size:
            return src_start + (dst - dst_start)
    return dst


def find_value(src: int, maps):
    for dst_start, src_start, size in maps:
        if src >= src_start and src < src_start + size:
            return dst_start + (src - src_start)
    return src


def part1(s: str):
    chunks = paras(s)
    seeds = all_numbers(chunks.pop(0)[0])

    fwd_map = {}
    rev_map = {}
    fwd_path = {}
    rev_path = {}
    for chunk in chunks:
        [src, dst, *_] = re.split(r"-to-| ", chunk.pop(0))
        fwd_map[src] = []
        fwd_path[src] = dst
        rev_map[dst] = []
        rev_path[dst] = src
        for line in chunk:
            [dst_start, src_start, size] = all_numbers(line)
            fwd_map[src].append((dst_start, src_start, size))
            rev_map[dst].append((dst_start, src_start, size))
        fwd_map[src].sort()
        rev_map[dst].sort()

    found = []
    for seed in seeds:
        cur = "seed"
        nn = seed
        while cur != "location":
            maps = fwd_map[cur]
            nn = find_value(nn, maps)
            cur = fwd_path[cur]
        found.append(nn)
    return min(found)


def batched(iterable, n):
    "Batch data into tuples of length n. The last batch may be shorter."
    # batched('ABCDEFG', 3) --> ABC DEF G
    if n < 1:
        raise ValueError("n must be at least one")
    it = iter(iterable)
    while batch := tuple(islice(it, n)):
        yield batch


def part2(s: str):
    # if len(s) > 500:
    #     return
    chunks = paras(s)
    seed_pairs = all_numbers(chunks.pop(0)[0])

    fwd_map = {}
    rev_map = {}
    fwd_path = {}
    rev_path = {}
    for chunk in chunks:
        [src, dst, *_] = re.split(r"-to-| ", chunk.pop(0))
        fwd_map[src] = []
        fwd_path[src] = dst
        rev_map[dst] = []
        rev_path[dst] = src
        for line in chunk:
            [dst_start, src_start, size] = all_numbers(line)
            fwd_map[src].append((dst_start, src_start, size))
            rev_map[dst].append((dst_start, src_start, size))
        fwd_map[src].sort()
        rev_map[dst].sort()

    for i in count():
        cur = "location"
        nn = i
        while cur != "seed":
            maps = rev_map[cur]
            nn = find_value_rev(nn, maps)
            cur = rev_path[cur]

        for start, size in batched(seed_pairs, 2):
            if nn >= start and nn < start + size:
                return i


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
