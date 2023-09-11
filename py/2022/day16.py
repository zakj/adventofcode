import itertools
import re
import sys
from collections import defaultdict, deque
from typing import NamedTuple

from aoc import main


class Valve(NamedTuple):
    name: str
    rate: int
    tunnels: list[str]


def parse(input: str) -> list[Valve]:
    name_pat = re.compile(r"[A-Z]{2}")
    rate_pat = re.compile(r"\d+")
    valves: list[Valve] = []
    for line in input.splitlines():
        name, *tunnels = name_pat.findall(line)
        rate = rate_pat.search(line)
        if rate:
            valves.append(Valve(name, int(rate[0]), tunnels))
    return valves


# https://en.wikipedia.org/wiki/Floyd–Warshall_algorithm
def floyd_warshall(valves: list[Valve]) -> dict[tuple[str, str], int]:
    distance = defaultdict[tuple[str, str], int](lambda: sys.maxsize)
    for name, _, tunnels in valves:
        for dst in tunnels:
            distance[name, dst] = 1
    all_names = [name for (name, *_) in valves]
    for k, i, j in itertools.product(all_names, all_names, all_names):
        distance[i, j] = min(distance[i, j], distance[i, k] + distance[k, j])
    return distance


def max_pressure(valves: list[Valve], minutes: int, elephant: bool = False) -> int:
    distance = floyd_warshall(valves)
    flow = {name: rate for name, rate, _ in valves if rate > 0}
    openable = frozenset(flow)

    q = deque[tuple[str, int, frozenset[str], int]]([("AA", 0, frozenset(), 0)])
    best: dict[frozenset[str], int] = {}
    while q:
        name, t, opened, pressure = q.pop()
        best[opened] = max(pressure, best.get(opened, 0))
        for next in openable - opened:
            nt = t + distance[name, next] + 1
            if nt >= minutes:
                continue
            q.append(
                (next, nt, opened | {next}, pressure + flow[next] * (minutes - nt))
            )

    if not elephant:
        return max(best.values())
    else:
        return max(
            best[a] + best[b] for a, b in itertools.combinations(best, 2) if not a & b
        )


if __name__ == "__main__":
    main(
        lambda s: max_pressure(parse(s), 30),
        lambda s: max_pressure(parse(s), 26, elephant=True),
    )
