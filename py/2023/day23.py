from aoc import main
from aoc.coords import Dir, Point, Vector, addp
from aoc.graph import DiGraph, GridGraph

SLOPES = {
    "^": Dir.N,
    ">": Dir.E,
    "v": Dir.S,
    "<": Dir.W,
}


def dfs(G: DiGraph, start: Point, end: Point):
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
        for neighbor in G[cur]:
            queue.append((neighbor, distance + G.edges[cur, neighbor]))
    return best


def compress(G: DiGraph[Point], start: Point) -> DiGraph[Point]:
    def next_branch(start, seen) -> tuple[Point, int]:
        cur = start
        distance = 0
        while True:
            seen.add(cur)
            distance += 1
            neighbors = G[cur] - seen
            if len(neighbors) != 1:
                return cur, distance
            cur = neighbors.pop()

    H = DiGraph()
    queue: list[Point] = [start]
    seen = set()
    while queue:
        cur = queue.pop()
        if cur in seen:
            continue
        seen.add(cur)
        for neighbor in G[cur]:
            branch, weight = next_branch(neighbor, {cur})
            H.add_edge(cur, branch, weight)
            H.add_edge(branch, cur, weight)
            queue.append(branch)
    return H


def longest_path(s: str, slopes: dict[str, Vector] = {}) -> int:
    def edgeweight(src: Point, stype: str, dst: Point, dtype: str) -> bool:
        if stype in slopes:
            return addp(src, slopes[stype]) == dst
        return stype != "#" and dtype != "#"

    G = GridGraph(s, edgeweight)
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
