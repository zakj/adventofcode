# TODO: speed up, clean up
from itertools import pairwise

from aoc import main
from coords import Dir, Point, addp
from graph import Graph


def dfs(G, node, seen=None, path=None):
    if seen is None:
        seen = set()
    if path is None:
        path = [node]
    seen.add(node)

    paths = []
    for neighbor in G.neighbors(node):
        if neighbor not in seen:
            next_path = path + [neighbor]
            paths.append(tuple(next_path))
            paths.extend(dfs(G, neighbor, seen.copy(), next_path))
    return paths


import sys

# TODO noooo
sys.setrecursionlimit(100000)


def part1(s: str) -> int:
    def edgeweights(from_node: Point, from_data, to_node: Point, to_data) -> bool:
        fl, tl = from_data["label"], to_data["label"]
        if fl == "^":
            return addp(from_node, Dir.N) == to_node
        if fl == ">":
            return addp(from_node, Dir.E) == to_node
        if fl == "v":
            return addp(from_node, Dir.S) == to_node
        if fl == "<":
            return addp(from_node, Dir.W) == to_node
        return fl != "#" and tl != "#"

    def attrs(c: str) -> dict:
        return {"label": c}

    G = Graph.from_grid(s, edgeweights, attrs)
    lines = s.splitlines()
    start = (lines[0].index("."), 0)
    end = (lines[-1].index("."), len(lines) - 1)

    all_paths = dfs(G, start)
    right_paths = [p for p in all_paths if p[-1] == end]
    return max(len(p) for p in right_paths) - 1


from graphlib import TopologicalSorter


def part2(s: str) -> int:
    # if len(s) > 1000:
    #     return -3

    def edgeweights(from_node: Point, from_data, to_node: Point, to_data) -> bool:
        fl, tl = from_data["label"], to_data["label"]
        return fl != "#" and tl != "#"

    def attrs(c: str) -> dict:
        return {"label": c}

    G = Graph.from_grid(s, edgeweights, attrs)
    lines = s.splitlines()
    start = (lines[0].index("."), 0)
    end = (lines[-1].index("."), len(lines) - 1)

    Gp: Graph[Point] = Graph()

    def next_branch(start, end, seen) -> list[Point]:
        cur = start
        path = [start]
        while True:
            seen.add(cur)
            path.append(cur)
            neighbors = set(G.neighbors(cur)) - seen
            if cur == end or len(neighbors) > 1:
                return path
            if not neighbors:
                return []
            cur = list(neighbors)[0]

    # simplify graph
    seen: set[Point] = set()
    queue: list[Point] = [start]
    while queue:
        cur = queue.pop()
        if cur in seen:
            continue
        seen.add(cur)
        for neighbor in G.neighbors(cur):
            if neighbor in seen:
                continue
            *path, branch = next_branch(neighbor, end, {cur})
            seen |= set(path)
            Gp.add_edge(cur, branch, weight=len(path))
            Gp.add_edge(branch, cur, weight=len(path))
            queue.append(branch)

    # TODO
    # ts = TopologicalSorter()
    # for u, vs in G.edges.items():
    #     ts.add(u, tuple(vs.keys()))
    # if len(s) > 1000:
    #     return -2
    # st = list(ts.static_order())
    # dist = {}
    # for node in st:
    #     us = [(dist[u][0] + 1, u) for u in G.edges[node].items()]
    #     maxu = max(us, key=lambda x: x[0]) if us else (0, node)
    #     dist[node] = maxu if maxu[0] >= 0 else (0, node)
    # print(f"{dist=}")

    def weigh(G: Graph, path: list[Point]) -> int:
        total = 0
        for a, b in pairwise(path):
            total += G.edges[a][b]["weight"]
        return total

    all_paths = dfs(Gp, start)
    right_paths = [weigh(Gp, p) for p in all_paths if p[-1] == end]
    return max(p for p in right_paths)


if __name__ == "__main__":
    main(
        lambda s: part1(s),
        lambda s: part2(s),
    )
