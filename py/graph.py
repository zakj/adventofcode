from collections import defaultdict
from collections.abc import Callable, Iterable
from itertools import pairwise
from typing import Any, Generic, TypeVar

from coords import Point

Node = TypeVar("Node")
GraphAttrs = dict[str, Any]


class DirectedGraph(Generic[Node]):
    def __init__(self) -> None:
        self._adj: dict[Node, set[Node]] = defaultdict(set)
        self._attrs: dict[Node, dict] = defaultdict(dict)
        self._weight: dict[tuple[Node, Node], int] = {}

    def __repr__(self) -> str:
        return f"Graph with {len(self)} nodes, {len(list(self.edges))} edges"

    def __contains__(self, node: Node) -> bool:
        return node in self._adj

    def __len__(self):
        return len(self._adj)

    @property
    def nodes(self) -> dict[Node, dict]:
        return self._attrs

    @property
    def edges(self) -> dict[tuple[Node, Node], int]:
        return self._weight

    def neighbors(self, node: Node) -> set[Node]:
        return self._adj[node]

    def add_node(self, node: Node, **kwargs) -> None:
        self._adj[node]
        self._attrs[node].update(**kwargs)

    def add_edge(self, a: Node, b: Node, weight: int = 1) -> None:
        self.add_node(a)
        self.add_node(b)
        self._adj[a].add(b)
        self._weight[a, b] = weight

    def remove_node(self, node: Node) -> None:
        edges = [(u, v) for (u, v) in self.edges if node in (u, v)]
        for u, v in edges:
            self.remove_edge(u, v)
        del self._adj[node]
        del self._attrs[node]

    def remove_edge(self, a: Node, b: Node) -> None:
        self._adj[a].remove(b)
        del self._weight[a, b]

    @classmethod
    def from_grid(
        cls,
        s: str,
        edgeweightfn: Callable[[Point, dict, Point, dict], bool | int],
        attrsfn: Callable[[str], dict] = lambda c: {"label": c},
    ) -> "DirectedGraph[Point]":
        lines = s.splitlines()
        cols = range(len(lines[0]))
        rows = range(len(lines))

        G = DirectedGraph()
        for y in rows:
            for x in cols:
                G.add_node((x, y), **attrsfn(lines[y][x]))

        adjacents = [((x, y), (px, y)) for y in rows for px, x in pairwise(cols)]
        adjacents += [((x, y), (x, py)) for py, y in pairwise(rows) for x in cols]
        adjacents += [(b, a) for a, b in adjacents]

        for a, b in adjacents:
            r = edgeweightfn(a, G.nodes[a], b, G.nodes[b])
            match r:
                case True:
                    G.add_edge(a, b, weight=1)
                case False:
                    pass
                case int(weight):
                    G.add_edge(a, b, weight=weight)

        return G


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


def compress(G: DirectedGraph) -> None:
    """Remove nodes between exactly two other nodes. Slow, but generic."""
    for node in list(G.nodes):
        neighbors = G.neighbors(node)
        if len(neighbors) != 2:
            continue
        a, b = neighbors
        # a and b must not already be connected, and a<->node<->b must be two-way.
        assert b not in G.neighbors(a) and a not in G.neighbors(b)
        assert node in G.neighbors(a) and node in G.neighbors(b)
        weight = G.edges[a, node] + G.edges[node, b]
        G.add_edge(a, b, weight)
        G.add_edge(b, a, weight)
        G.remove_node(node)


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
