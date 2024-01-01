from collections.abc import Iterable

from aoc import main
from coords import Dir, Point, subp
from graph import GridGraph, shortest_path_lengths_from

PIPES = {
    "|": set([Dir.N, Dir.S]),
    "-": set([Dir.W, Dir.E]),
    "L": set([Dir.N, Dir.E]),
    "J": set([Dir.N, Dir.W]),
    "7": set([Dir.S, Dir.W]),
    "F": set([Dir.S, Dir.E]),
    ".": {},
}


def build_graph(s: str) -> tuple[GridGraph, Point]:
    def edgeweight(src, stype, dst, dtype) -> bool:
        if "S" in [stype, dtype]:
            return "." not in [stype, dtype]
        src_delta = subp(dst, src)
        dst_delta = subp(src, dst)
        return src_delta in PIPES[stype] and dst_delta in PIPES[dtype]

    G = GridGraph(s, edgeweight)

    start = next(n for n, c in G.type.items() if c == "S")
    start_edges = set()
    for node in G[start].copy():
        node_to_start_dir = subp(start, node)
        if node_to_start_dir not in PIPES[G.type[node]]:
            G.remove_edge(node, start)
            G.remove_edge(start, node)
        else:
            start_edges.add(subp(node, start))
    for k, v in PIPES.items():
        if v == start_edges:
            G.type[start] = k
            break

    return G, start


def farthest_from_start(G: GridGraph, start: Point) -> int:
    return max(d for _, d in shortest_path_lengths_from(G, start))


def ray_northwest(x: int, y: int) -> Iterable[Point]:
    while x > 0 and y > 0:
        x -= 1
        y -= 1
        yield (x, y)


def enclosed(G: GridGraph, start: Point) -> int:
    loop = set(n for n, _ in shortest_path_lengths_from(G, start))
    valid_crossings = set(n for n in loop if G.type[n] not in "7L")
    enclosed = 0
    for x, y in set(G) - loop:
        crossings = sum(1 for n in ray_northwest(x, y) if n in valid_crossings)
        if crossings % 2 == 1:
            enclosed += 1
    return enclosed


if __name__ == "__main__":
    main(
        lambda s: farthest_from_start(*build_graph(s)),
        lambda s: enclosed(*build_graph(s)),
    )
