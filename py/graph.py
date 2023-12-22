from collections import defaultdict
from collections.abc import Callable, Iterable
from itertools import pairwise
from typing import Any, Generic, TypeVar

from coords import Point

Node = TypeVar("Node")
GraphAttrs = dict[str, Any]


class Graph(Generic[Node]):
    nodes: dict[Node, GraphAttrs]
    edges: dict[Node, dict[Node, GraphAttrs]]

    def __init__(self) -> None:
        self.nodes = defaultdict(dict)
        self.edges = defaultdict(lambda: defaultdict(dict))

    def __repr__(self) -> str:
        nodes = len(self.nodes)
        edges = sum(len(target) for target in self.edges.values())
        return f"Graph with {nodes} nodes, {edges} edges"

    def add_node(self, node: Node, **attrs) -> None:
        self.nodes[node].update(**attrs)

    def add_edge(self, a: Node, b: Node, **attrs) -> None:
        if a not in self.nodes:
            self.add_node(a)
        if b not in self.nodes:
            self.add_node(b)
        self.edges[a][b].update(**attrs)

    def remove_edge(self, a: Node, b: Node) -> None:
        del self.edges[a][b]

    def neighbors(self, node: Node) -> Iterable[Node]:
        return self.edges[node]

    @classmethod
    def from_grid(
        cls,
        s: str,
        edgeweightfn: Callable[[Point, GraphAttrs, Point, GraphAttrs], bool | int],
        attrsfn: Callable[[str], GraphAttrs] = lambda c: {"label": c},
    ) -> "Graph[Point]":
        lines = s.splitlines()
        cols = range(len(lines[0]))
        rows = range(len(lines))

        G = Graph()
        for y in rows:
            for x in cols:
                G.add_node((x, y), **attrsfn(lines[y][x]))

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


def shortest_path(G: Graph[Node], start: Node, end: Node) -> list[Node]:
    visited = {start}
    queue = [(start, [start])]
    while queue:
        cur, path = queue.pop(0)
        for neighbor in G.neighbors(cur):
            npath = path + [neighbor]
            if neighbor == end:
                return npath
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, npath))
    return []


def shortest_path_length(G: Graph[Node], start: Node, end: Node) -> int:
    distance = 0
    visited = {start}
    queue = [start]
    while queue:
        distance += 1
        current = queue
        queue = []
        for node in current:
            for neighbor in G.neighbors(node):
                if neighbor == end:
                    return distance
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
    return -1


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
