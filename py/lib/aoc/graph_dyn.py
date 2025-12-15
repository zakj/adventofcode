import sys
from abc import abstractmethod
from collections import defaultdict
from collections.abc import Callable, Hashable, Iterator, Mapping
from heapq import heappop, heappush
from itertools import product
from typing import Protocol, overload


class NoPath(Exception): ...


type Edges[T: Hashable] = Mapping[T, set[T]]
type WeightFn[T] = Callable[[T, T], int]


class DiGraph[T: Hashable](Mapping[T, set[T]]):
    @abstractmethod
    def __getitem__(self, key: T, /) -> set[T]:
        """Set of edges for the given node."""
        raise NotImplementedError

    def __iter__(self) -> Iterator[T]:
        """Iterate through all nodes."""
        raise NotImplementedError

    def __len__(self) -> int:
        """Count of nodes."""
        raise NotImplementedError

    def weight(self, _a: T, _b: T) -> int:
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


def _simple_weight_fn[T](_a: T, _b: T) -> int:
    return 1


@overload
def shortest_path_length[T](
    G: Edges[T], source: T, target: Comparable, weight: WeightFn[T] = _simple_weight_fn
) -> int: ...


@overload
def shortest_path_length[T](
    G: Edges[T], source: T, target: None = None, weight: WeightFn[T] = _simple_weight_fn
) -> dict[T, int]: ...


def shortest_path_length[T](
    G: Edges[T],
    source: T,
    target: Comparable | None = None,
    weight: WeightFn[T] = _simple_weight_fn,
) -> int | dict[T, int]:
    # TODO: bfs may be faster if we don't need to track weight
    end, distance, *_ = _dijkstra(G, source, target, weight)
    if target is not None:
        return distance[end] if end is not None else -1
    else:
        return distance


@overload
def shortest_path[T](
    G: Edges[T], source: T, target: Comparable, weight: WeightFn[T] = _simple_weight_fn
) -> list[T]: ...


@overload
def shortest_path[T](
    G: Edges[T], source: T, target: None = None, weight: WeightFn[T] = _simple_weight_fn
) -> dict[T, list[T]]: ...


def shortest_path[T](
    G: Edges[T],
    source: T,
    target: Comparable | None = None,
    weight: Callable[[T, T], int] = _simple_weight_fn,
) -> list[T] | dict[T, list[T]]:
    # TODO: bfs may be faster if we don't need to track weight
    end, _distance, paths, _ = _dijkstra(G, source, target, weight, with_path=True)
    return paths[end] if end is not None else []


def all_shortest_paths[T](
    G: Edges[T],
    source: T,
    target: Comparable,
    weight: Callable[[T, T], int] = _simple_weight_fn,
) -> list[list[T]]:
    # TODO: bfs may be faster if we don't need to track weight
    end, _distance, _, previous = _dijkstra(
        G, source, target, weight, with_all_paths=True
    )

    paths = []
    stack = [(end, [end])]
    while stack:
        cur, path = stack.pop()
        if cur in previous:
            stack.extend((p, [p, *path]) for p in previous[cur])
        else:
            paths.append(path)
    return paths


# https://en.wikipedia.org/wiki/Floyd-Warshall_algorithm
def all_shortest_path_lengths[T](G: Edges[T]) -> dict[tuple[T, T], int]:
    distance = defaultdict[tuple[T, T], int](lambda: sys.maxsize)
    for src in G:
        for dst in G[src]:
            distance[src, dst] = 1
    for k, i, j in product(G, G, G):
        distance[i, j] = min(distance[i, j], distance[i, k] + distance[k, j])
    return dict(distance)


@overload
def _dijkstra[T](
    G: Edges[T],
    source: T,
    target: Comparable,
    weight: Callable[[T, T], int],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[T, dict[T, int], dict[T, list[T]], dict[T, list[T]]]: ...


@overload
def _dijkstra[T](
    G: Edges[T],
    source: T,
    target: None,
    weight: Callable[[T, T], int],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[None, dict[T, int], dict[T, list[T]], dict[T, list[T]]]: ...


def _dijkstra[T](
    G: Edges[T],
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
            elif nd == seen[neighbor] and with_all_paths:
                previous[neighbor].append(cur)
    return end, distance, paths, previous
