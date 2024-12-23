from ast import arg
from collections import defaultdict
from itertools import combinations, product

from websockets.sync.client import connect

from aoc import main, progress
from graph_dyn import (
    all_shortest_path_lengths,
    all_shortest_paths,
    shortest_path_length,
)


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


def best_region_orig(
    nodes: set[str], distances: dict[tuple[str, str], int]
) -> set[str]:
    candidates = []
    branched = False
    for a, b in product(nodes, nodes):
        if a != b and distances[a, b] > 1:
            branched = True
            candidates.append(best_region(nodes - {a}, distances))
    if not branched:
        return nodes
    return max(candidates, key=len)


def best_region_new(edges, nodes: set[str]):
    xs = list(nodes)
    connected_count = defaultdict(int)
    for i, a in enumerate(xs):
        for b in xs[i + 1 :]:
            if a in edges[b]:
                connected_count[a] += 1
                connected_count[b] += 1
    # print(connected_count)
    x = max(connected_count.values())
    best = {n for n, c in connected_count.items() if c == x}
    return best if len(best) == x + 1 else set()


def best_region(edges, nodes: set) -> set[str]:
    candidates = []
    branched = False
    xs = list(nodes)
    for i, a in enumerate(xs):
        for b in xs[i + 1 :]:
            if a not in edges[b] or b not in edges[a]:
                branched = True
                candidates.append(best_region(edges, nodes - {a}))
    if not branched:
        return nodes
    return max(candidates, key=len)


def part2(s: str) -> str:
    edges = parse(s)
    regions = []
    # distances = all_shortest_path_lengths(edges)
    # print("wq", best_region_new(edges, edges["wq"]))
    # print("co", best_region_new(edges, edges["co"]))
    # return 0
    for node, neighbors in progress(edges.items()):
        regions.append({node} | best_region_new(edges, neighbors))
    region = max(regions, key=len)
    return ",".join(sorted(region))
    # possible_region = {node} | neighbors
    # for a, b in product(neighbors, neighbors):
    #     if distances[a, b] > 1:
    #         possible_region.discard(a)
    #         possible_region.discard(b)
    # print(node, possible_region)
    # found = True
    # region = {node}
    # for n in neighbors:
    #     if not edges[n] >= possible_region:
    #         possible_region.discard(n)
    # for a, b in product(neighbors, neighbors):
    #     if a == b:
    #         continue
    #     if distances[a, b] != 1:
    #         found = False
    # if found:
    #     print(node, neighbors)
    # for
    # region = {node}
    # print(neighbors)
    # for a in neighbors:
    #     if all(a in edges[b] for b in neighbors):
    #         region.add(a)
    # for a, b in product(neighbors, neighbors):
    #     if a == b:
    #         continue
    #     if node == "ub":
    #         print(" ", a, edges[a])
    #         print(" ", b, edges[b])
    #     if a in edges[b] and b in edges[a]:
    #         region |= {a, b}
    # if node == "ub":
    #     print(node, region)
    # if any(n.startswith("t") for n in region):
    #     regions.add(frozenset(region))
    best = max(regions, key=len)
    print(best)


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=0,
    )
