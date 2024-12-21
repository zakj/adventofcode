import sys
from abc import ABC, abstractmethod
from collections import defaultdict
from collections.abc import Callable, Hashable, Iterator
from heapq import heappop, heappush
from itertools import product
from typing import Protocol, overload


class NoPath(Exception): ...


type WeightFn[T] = Callable[[T, T], int]


# This should maybe be a protocol, but how to supply a weight default?
class DiGraph[T: Hashable](ABC):
    @abstractmethod
    def __getitem__(self, node: T) -> set[T]:
        """Set of neighbors for the given node."""
        return set()

    def __iter__(self) -> Iterator[T]:
        raise NotImplementedError

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


@overload
def shortest_path_length[T](
    G: DiGraph[T], source: T, target: Comparable, weight: WeightFn[T] | None = None
) -> int: ...


@overload
def shortest_path_length[T](
    G: DiGraph[T], source: T, target: None = None, weight: WeightFn[T] | None = None
) -> dict[T, int]: ...


def shortest_path_length[T](
    G: DiGraph[T],
    source: T,
    target: Comparable | None = None,
    weight: WeightFn[T] | None = None,
) -> int | dict[T, int]:
    if weight is None:
        weight = lambda a, b: 1
    # TODO: bfs may be faster if we don't need to track weight
    end, distance, *_ = _dijkstra(G, source, target, weight)
    if target is not None:
        return distance[end] if end is not None else -1
    else:
        return distance


@overload
def shortest_path[T](
    G: DiGraph[T], source: T, target: Comparable, weight: WeightFn[T] | None = None
) -> list[T]: ...


@overload
def shortest_path[T](
    G: DiGraph[T], source: T, target: None = None, weight: WeightFn[T] | None = None
) -> dict[T, list[T]]: ...


def shortest_path[T](
    G: DiGraph[T],
    source: T,
    target: Comparable | None = None,
    weight: Callable[[T, T], int] | None = None,
) -> list[T] | dict[T, list[T]]:
    if weight is None:
        weight = lambda a, b: 1
    # TODO: bfs may be faster if we don't need to track weight
    end, distance, paths, _ = _dijkstra(G, source, target, weight, with_path=True)
    return paths[end] if end is not None else []


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


# https://en.wikipedia.org/wiki/Floyd–Warshall_algorithm
def all_shortest_path_lengths[T](
    G: DiGraph[T],
) -> dict[tuple[T, T], int]:
    distance = defaultdict[tuple[T, T], int](lambda: sys.maxsize)
    for src in G:
        for dst in G[src]:
            distance[src, dst] = 1
    for k, i, j in product(G, G, G):
        distance[i, j] = min(distance[i, j], distance[i, k] + distance[k, j])
    return dict(distance)


@overload
def _dijkstra[T](
    G: DiGraph[T],
    source: T,
    target: Comparable,
    weight: Callable[[T, T], int],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[T, dict[T, int], dict[T, list[T]], dict[T, list[T]]]: ...


@overload
def _dijkstra[T](
    G: DiGraph[T],
    source: T,
    target: None,
    weight: Callable[[T, T], int],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[None, dict[T, int], dict[T, list[T]], dict[T, list[T]]]: ...


def _dijkstra[T](
    G: DiGraph[T],
    source: T,
    target: Comparable | None,
    weight: Callable[[T, T], int],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[T | None, dict[T, int], dict[T, list[T]], dict[T, list[T]]]:
    distance: dict[T, int] = {}
    seen: dict[T, int] = {}
    paths: dict[T, list[T]] = {source: [source]}
    previous: dict[T, list[T]] = {}

    end = None
    heap = [(0, source)]
    while heap:
        d, cur = heappop(heap)
        if cur in distance:
            continue
        distance[cur] = d
        if cur == target:
            end = cur
            break
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
    return end, distance, paths, previous
