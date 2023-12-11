from collections import defaultdict
from collections.abc import Iterable
from itertools import pairwise
from typing import Any, Callable, Generic, TypeVar

from aoc import main
from coords import Dir

PIPES = {
    "|": set([Dir.N.value, Dir.S.value]),
    "-": set([Dir.W.value, Dir.E.value]),
    "L": set([Dir.N.value, Dir.E.value]),
    "J": set([Dir.N.value, Dir.W.value]),
    "7": set([Dir.S.value, Dir.W.value]),
    "F": set([Dir.S.value, Dir.E.value]),
    ".": set(),
}

Point = tuple[int, int]


def addp(a: Point, b: Point) -> Point:
    return a[0] + b[0], a[1] + b[1]


def subp(a: Point, b: Point) -> Point:
    return a[0] - b[0], a[1] - b[1]


Node = TypeVar("Node")
GraphAttrs = dict[str, Any]


# TODO: factor this out into a graph module
class Graph(Generic[Node]):
    nodes: dict[Node, GraphAttrs]
    edges: dict[Node, dict[Node, GraphAttrs]]

    def __init__(self) -> None:
        self.nodes = defaultdict(dict)
        self.edges = defaultdict(lambda: defaultdict(dict))

    def add_node(self, node: Node, **attrs) -> None:
        self.nodes[node].update(**attrs)

    def add_edge(self, a: Node, b: Node, **attrs) -> None:
        self.edges[a][b].update(**attrs)

    def remove_edge(self, a: Node, b: Node) -> None:
        del self.edges[a][b]

    def neighbors(self, node: Node) -> Iterable[Node]:
        return self.edges[node]


def grid_graph(
    s: str,
    edgeweightfn: Callable[[Point, GraphAttrs, Point, GraphAttrs], bool | int],
    mapfn: Callable[[str], GraphAttrs] = lambda c: {"label": c},
) -> Graph[Point]:
    lines = s.splitlines()
    cols = range(len(lines[0]))
    rows = range(len(lines))

    G = Graph()
    for y in rows:
        for x in cols:
            G.add_node((x, y), **mapfn(lines[y][x]))

    # TODO: cleanup, this is so confusing
    adjacents = [((x, y), (x, py)) for py, y in pairwise(rows) for x in cols] + [
        ((x, y), (px, y)) for y in rows for px, x in pairwise(cols)
    ]
    for a, b in adjacents + [(b, a) for a, b in adjacents]:
        r = edgeweightfn(a, G.nodes[a], b, G.nodes[b])
        match r:
            case True:
                G.add_edge(a, b, weight=1)
            case False:
                pass
            case int(weight):
                G.add_edge(a, b, weight=weight)

    return G


def shortest_path_lengths_from(
    G: Graph[Node], start: Node
) -> Iterable[tuple[Node, int]]:
    distance = 0
    visited = {start}
    yield start, distance
    queue = [start]
    while queue:
        distance += 1
        current = queue
        queue = []
        for node in current:
            for neighbor in G.neighbors(node):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    yield neighbor, distance


def is_valid_edge(from_node, from_data, to_node, to_data) -> bool:
    if "S" in [from_data["label"], to_data["label"]]:
        return True
    from_delta = subp(to_node, from_node)
    to_delta = subp(from_node, to_node)
    return (
        from_delta in PIPES[from_data["label"]] and to_delta in PIPES[to_data["label"]]
    )


def build_graph(s: str) -> tuple[Graph, Point]:
    G = grid_graph(s, is_valid_edge)

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


def enclosed(G: Graph, start: Point) -> int:
    loop = set(n for n, _ in shortest_path_lengths_from(G, start))
    enclosed = 0
    for x, y in G.nodes:
        if (x, y) in loop:
            continue
        crossings = 0
        while x >= 0 and y >= 0:
            x -= 1
            y -= 1
            if (x, y) in loop and G.nodes[x, y]["label"] not in "7L":
                crossings += 1
        if crossings % 2 == 1:
            enclosed += 1
    return enclosed


if __name__ == "__main__":
    main(
        lambda s: farthest_from_start(*build_graph(s)),
        lambda s: enclosed(*build_graph(s)),
    )
