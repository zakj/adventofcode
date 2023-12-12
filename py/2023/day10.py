from collections.abc import Iterable

from aoc import main
from coords import Dir, Point, subp
from graph import Graph, shortest_path_lengths_from

PIPES = {
    "|": set([Dir.N.value, Dir.S.value]),
    "-": set([Dir.W.value, Dir.E.value]),
    "L": set([Dir.N.value, Dir.E.value]),
    "J": set([Dir.N.value, Dir.W.value]),
    "7": set([Dir.S.value, Dir.W.value]),
    "F": set([Dir.S.value, Dir.E.value]),
    ".": set(),
}


def is_valid_edge(from_node, from_data, to_node, to_data) -> bool:
    if "S" in [from_data["label"], to_data["label"]]:
        return True
    from_delta = subp(to_node, from_node)
    to_delta = subp(from_node, to_node)
    return (
        from_delta in PIPES[from_data["label"]] and to_delta in PIPES[to_data["label"]]
    )


def build_graph(s: str) -> tuple[Graph, Point]:
    G = Graph.from_grid(s, is_valid_edge)

    start = next(n for n, d in G.nodes.items() if d["label"] == "S")
    start_edges = set()
    for node in list(G.neighbors(start)):
        node_to_start_dir = subp(start, node)
        if node_to_start_dir not in PIPES[G.nodes[node]["label"]]:
            G.remove_edge(node, start)
            G.remove_edge(start, node)
        else:
            start_edges.add(subp(node, start))
    for k, v in PIPES.items():
        if v == start_edges:
            G.nodes[start]["label"] = k
            break

    return G, start


def farthest_from_start(G: Graph, start: Point) -> int:
    return max(d for _, d in shortest_path_lengths_from(G, start))


def ray_northwest(x: int, y: int) -> Iterable[Point]:
    while x > 0 and y > 0:
        x -= 1
        y -= 1
        yield (x, y)


def enclosed(G: Graph, start: Point) -> int:
    loop = set(n for n, _ in shortest_path_lengths_from(G, start))
    valid_crossings = set(n for n in loop if G.nodes[n]["label"] not in "7L")
    enclosed = 0
    for x, y in set(G.nodes) - loop:
        crossings = sum(1 for n in ray_northwest(x, y) if n in valid_crossings)
        if crossings % 2 == 1:
            enclosed += 1
    return enclosed


if __name__ == "__main__":
    main(
        lambda s: farthest_from_start(*build_graph(s)),
        lambda s: enclosed(*build_graph(s)),
    )
