import re
from collections import defaultdict
from itertools import combinations

from aoc import main
from aoc.graph import IterableEdges, all_shortest_path_lengths
from aoc.parse import all_numbers


def parse(s: str) -> tuple[IterableEdges, dict[str, int]]:
    name_pat = re.compile(r"[A-Z]{2}")
    edges = {}
    flow = {}
    for line in s.splitlines():
        name, *tunnels = name_pat.findall(line)
        rate = all_numbers(line)[0]
        edges[name] = set(tunnels)
        flow[name] = rate
    return edges, flow


def max_pressure(s: str, minutes: int, elephant=False):
    G, flow = parse(s)
    openable = frozenset(name for name, rate in flow.items() if rate)
    distance = all_shortest_path_lengths(G)

    queue: list[tuple[str, int, frozenset[str], int]] = [("AA", 0, frozenset(), 0)]
    best: dict[frozenset[str], int] = defaultdict(int)
    while queue:
        name, t, opened, pressure = queue.pop()
        best[opened] = max(pressure, best[opened])
        for next in openable - opened:
            nt = t + distance[name, next] + 1
            if nt >= minutes:
                continue
            queue.append((next, nt, opened | {next}, pressure + flow[next] * (minutes - nt)))

    if not elephant:
        return max(best.values())
    else:
        return max(best[a] + best[b] for a, b in combinations(best, 2) if not a & b)


if __name__ == "__main__":
    main(
        lambda s: max_pressure(s, 30),
        lambda s: max_pressure(s, 26, elephant=True),
    )
