import re
from collections import defaultdict
from itertools import combinations

from aoc import main
from graph import DiGraph, all_shortest_path_lengths


def parse(s: str) -> tuple[DiGraph, dict[str, int]]:
    G = DiGraph()
    flow = {}
    name_pat = re.compile(r"[A-Z]{2}")
    rate_pat = re.compile(r"\d+")
    for line in s.splitlines():
        name, *tunnels = name_pat.findall(line)
        rate = rate_pat.search(line)
        for dst in tunnels:
            G.add_edge(name, dst)
        assert rate
        flow[name] = int(rate[0])
    return G, flow


def max_pressure(s: str, minutes: int, elephant=False):
    G, flow = parse(s)
    distance = all_shortest_path_lengths(G)
    openable = frozenset(name for name, rate in flow.items() if rate)

    queue: list[tuple[str, int, frozenset[str], int]] = [("AA", 0, frozenset(), 0)]
    best: dict[frozenset[str], int] = defaultdict(int)
    while queue:
        name, t, opened, pressure = queue.pop()
        best[opened] = max(pressure, best[opened])
        for next in openable - opened:
            nt = t + distance[name, next] + 1
            if nt >= minutes:
                continue
            queue.append(
                (next, nt, opened | {next}, pressure + flow[next] * (minutes - nt))
            )

    if not elephant:
        return max(best.values())
    else:
        return max(best[a] + best[b] for a, b in combinations(best, 2) if not a & b)


if __name__ == "__main__":
    main(
        lambda s: max_pressure(s, 30),
        lambda s: max_pressure(s, 26, elephant=True),
    )
