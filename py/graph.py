import sys
from collections import defaultdict, deque
from collections.abc import Callable, Generator, Hashable, Iterator
from itertools import pairwise, product

from coords import Point


class DiGraph[Node: Hashable]:
    """A representation of a directed graph.

    Instances work like a dictionary of node -> set of adjacent nodes.
    """

    _adj: dict[Node, set[Node]]  # node -> set of adjacent nodes
    edges: dict[tuple[Node, Node], int]  # (u, v) -> int weight

    def __init__(self) -> None:
        self._adj = defaultdict(set)
        self.edges = {}

    def __repr__(self) -> str:
        return f"{self.__class__.__name__} with {len(self)} nodes, {len(list(self.edges))} edges"

    def __contains__(self, node: Node) -> bool:
        return node in self._adj

    def __getitem__(self, node: Node) -> set[Node]:
        return self._adj[node]

    def __iter__(self) -> Iterator[Node]:
        return iter(self._adj)

    def __len__(self):
        return len(self._adj)

    def items(self):
        return self._adj.items()

    def add_node(self, node: Node, **kwargs) -> None:
        self._adj[node]

    def add_edge(self, a: Node, b: Node, weight: int = 1) -> None:
        self.add_node(a)
        self.add_node(b)
        self._adj[a].add(b)
        self.edges[a, b] = weight

    def remove_node(self, node: Node) -> None:
        edges = [(u, v) for (u, v) in self.edges if node in (u, v)]
        for u, v in edges:
            self.remove_edge(u, v)
        del self._adj[node]

    def remove_edge(self, a: Node, b: Node) -> None:
        self._adj[a].remove(b)
        del self.edges[a, b]


# TODO: del self.type[node] in remove_node; does it matter?
class GridGraph(DiGraph[Point]):
    type: dict[Point, str]  # node -> character

    def __init__(
        self, s: str, edgeweightfn: Callable[[Point, str, Point, str], bool | int]
    ) -> None:
        super().__init__()
        self.type = {}

        lines = s.splitlines()
        cols = range(len(lines[0]))
        rows = range(len(lines))

        for y in rows:
            for x in cols:
                self.add_node((x, y))
                self.type[x, y] = lines[y][x]

        adjacents = [((x, y), (px, y)) for y in rows for px, x in pairwise(cols)]
        adjacents += [((x, y), (x, py)) for py, y in pairwise(rows) for x in cols]
        adjacents += [(b, a) for a, b in adjacents]

        for a, b in adjacents:
            r = edgeweightfn(a, self.type[a], b, self.type[b])
            match r:
                case True:
                    self.add_edge(a, b, weight=1)
                case False:
                    pass
                case int(weight):
                    self.add_edge(a, b, weight=weight)


def compress(G: DiGraph) -> None:
    """Remove nodes between exactly two other nodes. Slow, but generic."""
    for node in list(G):
        if len(G[node]) != 2:
            continue
        a, b = G[node]
        # a and b must not already be connected, and a<->node<->b must be two-way.
        assert b not in G[a] and a not in G[b]
        assert node in G[a] and node in G[b]
        weight = G.edges[a, node] + G.edges[node, b]
        G.add_edge(a, b, weight)
        G.add_edge(b, a, weight)
        G.remove_node(node)


# https://en.wikipedia.org/wiki/Floyd–Warshall_algorithm
def all_shortest_path_lengths[Node](G: DiGraph[Node]) -> dict[tuple[Node, Node], int]:
    distance = defaultdict[tuple[Node, Node], int](lambda: sys.maxsize)
    for src, dsts in G.items():
        for dst in dsts:
            distance[src, dst] = 1
    for k, i, j in product(G, G, G):
        distance[i, j] = min(distance[i, j], distance[i, k] + distance[k, j])
    return dict(distance)


def shortest_path[Node](G: DiGraph[Node], start: Node, end: Node) -> list[Node]:
    visited = {start}
    queue = deque([(start, [start])])
    while queue:
        cur, path = queue.popleft()
        for neighbor in G[cur] - visited:
            npath = path + [neighbor]
            if neighbor == end:
                return npath
            visited.add(neighbor)
            queue.append((neighbor, npath))
    return []


def shortest_path_length[Node](G: DiGraph[Node], start: Node, end: Node) -> int:
    distance = 0
    visited = {start}
    queue = [start]
    while queue:
        distance += 1
        current = queue
        queue = []
        for node in current:
            for neighbor in G[node] - visited:
                if neighbor == end:
                    return distance
                visited.add(neighbor)
                queue.append(neighbor)
    return -1


def shortest_path_lengths_from[Node](
    G: DiGraph[Node], start: Node
) -> Iterator[tuple[Node, int]]:
    distance = 0
    visited = {start}
    yield start, distance
    queue = [start]
    while queue:
        distance += 1
        current = queue
        queue = []
        for node in current:
            for neighbor in G[node] - visited:
                visited.add(neighbor)
                queue.append(neighbor)
                yield neighbor, distance


def all_paths[Node](G: DiGraph[Node], start: Node, end: Node) -> Generator[list[Node]]:
    queue = [(start, [start])]
    while queue:
        cur, path = queue.pop()
        if cur == end:
            yield path
        for neighbor in G[cur]:
            if neighbor not in path:
                queue.append((neighbor, path + [neighbor]))


def all_paths_by[Node](
    G: DiGraph[Node], start: Node, predicate: Callable[[Node], bool]
) -> Generator[list[Node]]:
    queue = [(start, [start])]
    while queue:
        cur, path = queue.pop()
        if predicate(cur):
            yield path
        for neighbor in G[cur]:
            if neighbor not in path:
                queue.append((neighbor, path + [neighbor]))
