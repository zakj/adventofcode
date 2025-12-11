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


def you_to_out(input: str):
    edges = parse(input)

    @cache
    def count_paths(cur: str) -> int:
        if cur == "out":
            return 1
        return sum(count_paths(n) for n in edges[cur])

    return count_paths("you")


def svr_to_out_via_dac_fft(input: str):
    edges = parse(input)
    via = {"dac": 0, "fft": 1}
    goal = Bitmask.from_list(via.values())

    @cache
    def count_paths(cur: str, seen: Bitmask) -> int:
        if cur == "out":
            return 1 if seen == goal else 0
        if cur in via:
            seen = seen.on(via[cur])
        return sum(count_paths(n, seen) for n in edges[cur])

    return count_paths("svr", Bitmask())


if __name__ == "__main__":
    main(
        you_to_out,
        svr_to_out_via_dac_fft,
    )
