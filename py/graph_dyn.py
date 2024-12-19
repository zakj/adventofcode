from abc import ABC, abstractmethod
from collections.abc import Callable, Hashable
from heapq import heappop, heappush
from typing import Protocol


class NoPath(Exception): ...


class DiGraph[T: Hashable](ABC):
    @abstractmethod
    def __getitem__(self, node: T) -> set[T]:
        """Set of neighbors for the given node."""
        return set()

    def weight(self, a: T, b: T) -> int:
        """Weight of the edge from a to b."""
        return 1


class Comparable(Protocol):
    def __eq__(self, other: object, /) -> bool: ...


class Goal[T]:
    """Used for handling cases where multiple nodes can be a target.

    For example, some puzzles ask for the shortest path to a given point on a
    grid, but direction is part of a node's state. In that case, we might do
    something like:

    type Node = tuple[Point, Vector]
    goal = Goal(lambda node: node[0] == (goal_x, goal_y))
    shortest_path(G, start, goal)
    """

    def __init__(self, check: Callable[[T], bool]):
        self.check = check

    def __eq__(self, other: object, /) -> bool:
        return self.check(other)  # type: ignore


def shortest_path_length[T](
    G: DiGraph[T],
    source: T,
    target: Comparable,
    weight: Callable[[T, T], int] | None = None,
) -> int:
    if weight is None:
        weight = lambda a, b: 1
    # TODO: bfs may be faster if we don't need to track weight
    try:
        end, distance, *_ = _dijkstra(G, source, target, weight)
        return distance[end]
    except NoPath:
        return -1


def shortest_path[T](
    G: DiGraph[T],
    source: T,
    target: Comparable,
    weight: Callable[[T, T], int] | None = None,
) -> list[T]:
    if weight is None:
        weight = lambda a, b: 1
    # TODO: bfs may be faster if we don't need to track weight
    end, distance, paths, _ = _dijkstra(G, source, target, weight, with_path=True)
    return paths[end]


def all_shortest_paths[T](
    G: DiGraph[T],
    source: T,
    target: Comparable,
    weight: Callable[[T, T], int] | None = None,
) -> list[list[T]]:
    if weight is None:
        weight = lambda a, b: 1
    # TODO: bfs may be faster if we don't need to track weight
    end, distance, _, previous = _dijkstra(
        G, source, target, weight, with_all_paths=True
    )

    paths = []
    stack = [(end, [end])]
    while stack:
        cur, path = stack.pop()
        if cur in previous:
            stack.extend((p, [p] + path) for p in previous[cur])
        else:
            paths.append(path)
    return paths


def _dijkstra[T](
    G: DiGraph[T],
    source: T,
    target: Comparable,
    weight: Callable[[T, T], int],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[T, dict[T, int], dict[T, list[T]], dict[T, list[T]]]:
    distance: dict[T, int] = {}
    seen: dict[T, int] = {}
    paths: dict[T, list[T]] = {}
    previous: dict[T, list[T]] = {}

    heap = [(0, source)]
    while heap:
        d, cur = heappop(heap)
        if cur in distance:
            continue
        distance[cur] = d
        if cur == target:
            return cur, distance, paths, previous
        for neighbor in G[cur]:
            nd = d + weight(cur, neighbor)
            if neighbor in distance:
                if with_all_paths and nd == distance[neighbor]:
                    previous[neighbor].append(cur)
            elif neighbor not in seen or nd < seen[neighbor]:
                seen[neighbor] = nd
                heappush(heap, (nd, neighbor))
                if with_path:
                    paths[neighbor] = paths[cur] + [neighbor]
                if with_all_paths:
                    previous[neighbor] = [cur]
            elif nd == seen[neighbor]:
                if with_all_paths:
                    previous[neighbor].append(cur)
    raise NoPath(f"no path found from {source} to {target}")
