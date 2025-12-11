import re
from functools import cache

from aoc import main
from aoc.graph_dyn import Edges


def parse(input: str) -> Edges[str]:
    edges = {}
    for line in input.splitlines():
        src, *dsts = re.split(r":? ", line)
        edges[src] = set(dsts)
    return edges


def count_paths(
    edges: Edges, src: str, dst: str, *, via: set[str] | None = None
) -> int:
    via = via or set()

    @cache
    def count(cur: str, seen: frozenset[str]) -> int:
        if cur == dst:
            return 1 if seen == via else 0
        if cur in via:
            seen = seen | {cur}
        return sum(count(n, seen) for n in edges[cur])

    return count(src, frozenset())


if __name__ == "__main__":
    main(
        lambda s: count_paths(parse(s), "you", "out"),
        lambda s: count_paths(parse(s), "svr", "out", via={"dac", "fft"}),
    )
