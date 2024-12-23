from collections import defaultdict
from itertools import combinations

from aoc import main


def parse(s: str):
    edges = defaultdict(set)
    for line in s.splitlines():
        a, b = line.split("-")
        edges[a].add(b)
        edges[b].add(a)
    return edges


def part1(s: str) -> int:
    edges = parse(s)
    regions = set()
    for node, neighbors in edges.items():
        for a, b in combinations(neighbors, 2):
            if b in edges[a] and a in edges[b]:
                regions.add(frozenset([node, a, b]))
    count = 0
    for region in regions:
        if any(node.startswith("t") for node in region):
            count += 1
    return count


def best_region(edges, nodes: set[str]):
    xs = list(nodes)
    connected_count = defaultdict(int)
    for i, a in enumerate(xs):
        for b in xs[i + 1 :]:
            if a in edges[b]:
                connected_count[a] += 1
                connected_count[b] += 1
    x = max(connected_count.values())
    best = {n for n, c in connected_count.items() if c == x}
    return best if len(best) == x + 1 else set()


def part2(s: str) -> str:
    edges = parse(s)
    regions = []
    for node, neighbors in edges.items():
        regions.append({node} | best_region(edges, neighbors))
    region = max(regions, key=len)
    return ",".join(sorted(region))


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
