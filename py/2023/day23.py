from collections import defaultdict

from aoc import main
from aoc.coords import Dir, Grid, Point, Vector, addp
from aoc.graph import Edges

SLOPES = {
    "^": Dir.N,
    ">": Dir.E,
    "v": Dir.S,
    "<": Dir.W,
}


def dfs(G: Edges, start: Point, end: Point, weights: dict[tuple[Point, Point], int]):
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
            queue.append((neighbor, distance + weights[cur, neighbor]))
    return best


def compress(G: Edges[Point], start: Point) -> tuple[Edges[Point], dict[tuple[Point, Point], int]]:
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

    H = defaultdict(set)
    weights = {}
    queue: list[Point] = [start]
    seen = set()
    while queue:
        cur = queue.pop()
        if cur in seen:
            continue
        seen.add(cur)
        for neighbor in G[cur]:
            branch, weight = next_branch(neighbor, {cur})
            H[cur].add(branch)
            H[branch].add(cur)
            weights[cur, branch] = weight
            weights[branch, cur] = weight
            queue.append(branch)
    return H, weights


def longest_path(s: str, slopes: dict[str, Vector] | None = None) -> int:
    if slopes is None:
        slopes = {}

    grid = Grid(s)
    G = {}
    for p in grid.data:
        if grid[p] in slopes:
            G[p] = {addp(p, slopes[grid[p]])}
        else:
            G[p] = {n for n in Dir.neighbors(p) if n in grid and grid[n] != "#"}

    lines = s.splitlines()
    start = (lines[0].index("."), 0)
    end = (lines[-1].index("."), len(lines) - 1)

    weights = defaultdict(lambda: 1)
    if not slopes:
        G, weights = compress(G, start)
    return dfs(G, start, end, weights)


if __name__ == "__main__":
    main(
        lambda s: longest_path(s, SLOPES),
        lambda s: longest_path(s),
    )
