from aoc import main
from coords import Dir, Point
from coords import VVector as Vector
from coords import addp
from graph import DirectedGraph, Node

SLOPES = {
    "^": Dir.N,
    ">": Dir.E,
    "v": Dir.S,
    "<": Dir.W,
}


def dfs(G: DirectedGraph[Point], start: Point, end: Point):
    seen = set()
    queue: list[tuple[Point, int]] = [(start, 0)]
    best = 0
    while queue:
        cur, distance = queue.pop()
        if distance == -1:
            seen.remove(cur)
            continue
        if cur == end:
            best = max(best, distance)
            continue
        if cur in seen:
            continue
        seen.add(cur)
        # Mark the node as visitable again after processing its children.
        queue.append((cur, -1))
        for neighbor in G.neighbors(cur):
            queue.append((neighbor, distance + G.edges[cur, neighbor]))
    return best


def compress(G: DirectedGraph[Point], start: Point) -> DirectedGraph[Point]:
    def next_branch(start, seen) -> tuple[Point, int]:
        cur = start
        distance = 0
        while True:
            seen.add(cur)
            distance += 1
            neighbors = G.neighbors(cur) - seen
            if len(neighbors) != 1:
                return cur, distance
            cur = neighbors.pop()

    H = DirectedGraph()
    queue: list[Point] = [start]
    seen = set()
    while queue:
        cur = queue.pop()
        if cur in seen:
            continue
        seen.add(cur)
        for neighbor in G.neighbors(cur):
            branch, weight = next_branch(neighbor, {cur})
            H.add_edge(cur, branch, weight)
            H.add_edge(branch, cur, weight)
            queue.append(branch)
    return H


def longest_path(s: str, slopes: dict[str, Vector] = {}) -> int:
    def edgeweight(from_node: Point, from_data, to_node: Point, to_data) -> bool:
        c = from_data["label"]
        if c in slopes:
            return addp(from_node, slopes[c]) == to_node
        return c != "#" and to_data["label"] != "#"

    G = DirectedGraph.from_grid(s, edgeweight)
    lines = s.splitlines()
    start = (lines[0].index("."), 0)
    end = (lines[-1].index("."), len(lines) - 1)

    if not slopes:
        G = compress(G, start)
    return dfs(G, start, end)


if __name__ == "__main__":
    main(
        lambda s: longest_path(s, SLOPES),
        lambda s: longest_path(s),
    )
