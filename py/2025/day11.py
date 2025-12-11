import re
from functools import cache, partial

from aoc import main
from aoc.collections import Bitmask
from aoc.graph_dyn import Edges


def parse(input: str) -> Edges[str]:
    edges = {}
    for line in input.splitlines():
        src, *dsts = re.split(r":? ", line)
        edges[src] = set(dsts)
    return edges


def count_paths(input: str, src: str, dst: str, via: list[str] | None = None) -> int:
    edges = parse(input)

    if via is None:
        via = []
    via_mask = {k: i for i, k in enumerate(via)}
    goal = Bitmask.from_list(via_mask.values())

    @cache
    def count(cur: str, seen: Bitmask) -> int:
        if cur == dst:
            return 1 if seen == goal else 0
        if cur in via_mask:
            seen = seen.on(via_mask[cur])
        return sum(count(n, seen) for n in edges[cur])

    return count(src, Bitmask())


if __name__ == "__main__":
    main(
        partial(count_paths, src="you", dst="out"),
        partial(count_paths, src="svr", dst="out", via=["dac", "fft"]),
    )
