from collections import defaultdict
from itertools import combinations

from aoc import main
from aoc.graph_dyn import Edges


def parse(s: str) -> dict[str, set[str]]:
    edges = defaultdict(set)
    for line in s.splitlines():
        a, b = line.split("-")
        edges[a].add(b)
        edges[b].add(a)
    return edges


def sets_of_three(s: str) -> int:
    edges = parse(s)
    regions = set()
    for node, neighbors in edges.items():
        for a, b in combinations(neighbors, 2):
            if a in edges[b] and any(n.startswith("t") for n in [node, a, b]):
                regions.add(frozenset([node, a, b]))
    return len(regions)


def best_region(edges: Edges, nodes: set[str]):
    connected_count = defaultdict(int)
    for a, b in combinations(nodes, 2):
        if a in edges[b]:
            connected_count[a] += 1
            connected_count[b] += 1
    x = max(connected_count.values())
    best = {n for n, c in connected_count.items() if c == x}
    return best if len(best) == x + 1 else set()


def password_to_lan_party(s: str) -> str:
    edges = parse(s)
    regions = []
    for node, neighbors in edges.items():
        regions.append({node} | best_region(edges, neighbors))
    region = max(regions, key=len)
    return ",".join(sorted(region))


if __name__ == "__main__":
    main(sets_of_three, password_to_lan_party)
