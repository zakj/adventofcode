import sys
from collections import defaultdict, deque
from collections.abc import Callable, Hashable, Iterator
from heapq import heappop, heappush
from itertools import product
from typing import Protocol, overload

type WeightFn[T] = Callable[[T, T], int]


class Edges[T: Hashable](Protocol):
    def __getitem__(self, key: T, /) -> set[T]:
        """Set of edges for the given node."""
        ...


class IterableEdges[T: Hashable](Protocol):
    def __getitem__(self, key: T, /) -> set[T]:
        """Set of edges for the given node."""
        ...

    def __iter__(self) -> Iterator[T]:
        """All nodes."""
        ...


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
    G: Edges[T], source: T, target: Comparable, weight: WeightFn[T] | None = None
) -> int: ...


@overload
def shortest_path_length[T](
    G: Edges[T], source: T, target: None = None, weight: WeightFn[T] | None = None
) -> dict[T, int]: ...


def shortest_path_length[T](
    G: Edges[T],
    source: T,
    target: Comparable | None = None,
    weight: WeightFn[T] | None = None,
) -> int | dict[T, int]:
    if weight is None:
        end, distance, _previous = _bfs(G, source, target)
    else:
        end, distance, _previous = _dijkstra(G, source, target, weight)
    if target is not None:
        return distance[end] if end is not None else -1
    else:
        return distance


def shortest_path[T](
    G: Edges[T],
    source: T,
    target: Comparable,
    weight: WeightFn[T] | None = None,
) -> list[T]:
    if weight is None:
        end, _distance, previous = _bfs(G, source, target, with_path=True)
    else:
        end, _distance, previous = _dijkstra(G, source, target, weight, with_path=True)
    if end is None:
        return []
    path = [end]
    cur = end
    while cur != source:
        cur = previous[cur][0]
        path.append(cur)
    return path[::-1]


def all_shortest_paths[T](
    G: Edges[T],
    source: T,
    target: Comparable,
    weight: WeightFn[T] | None = None,
) -> list[list[T]]:
    if weight is None:
        end, _distance, previous = _bfs(G, source, target, with_all_paths=True)
    else:
        end, _distance, previous = _dijkstra(G, source, target, weight, with_all_paths=True)
    paths = []
    if end is None:
        return paths
    stack = [(end, [end])]
    while stack:
        cur, path = stack.pop()
        if cur in previous:
            stack.extend((p, [p, *path]) for p in previous[cur])
        else:
            paths.append(path)
    return paths


# https://en.wikipedia.org/wiki/Floyd-Warshall_algorithm
def all_shortest_path_lengths[T](G: IterableEdges[T]) -> dict[tuple[T, T], int]:
    distance = defaultdict[tuple[T, T], int](lambda: sys.maxsize)
    for src in G:
        distance[src, src] = 0
        for dst in G[src]:
            distance[src, dst] = 1
    for k, i, j in product(G, G, G):
        distance[i, j] = min(distance[i, j], distance[i, k] + distance[k, j])
    return {k: v for k, v in distance.items() if v < sys.maxsize}


@overload
def _bfs[T](
    G: Edges[T],
    source: T,
    target: None,
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[None, dict[T, int], dict[T, list[T]]]: ...


@overload
def _bfs[T](
    G: Edges[T],
    source: T,
    target: Comparable,
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[T, dict[T, int], dict[T, list[T]]]: ...


def _bfs[T](
    G: Edges[T],
    source: T,
    target: Comparable | None,
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[T | None, dict[T, int], dict[T, list[T]]]:
    distance: dict[T, int] = {source: 0}
    previous: dict[T, list[T]] = {}

    end = None
    queue = deque([source])
    while queue:
        cur = queue.popleft()
        cur_dist = distance[cur]

        if with_all_paths and end is not None and cur_dist > distance[end]:
            break
        if cur == target:
            end = cur
            if not with_all_paths:
                break

        for neighbor in G[cur]:
            if neighbor not in distance:
                distance[neighbor] = cur_dist + 1
                queue.append(neighbor)
                if with_path or with_all_paths:
                    previous[neighbor] = [cur]
            elif with_all_paths and distance[neighbor] == cur_dist + 1:
                previous[neighbor].append(cur)

    return end, distance, previous


@overload
def _dijkstra[T](
    G: Edges[T],
    source: T,
    target: None,
    weight: WeightFn[T],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[None, dict[T, int], dict[T, list[T]]]: ...


@overload
def _dijkstra[T](
    G: Edges[T],
    source: T,
    target: Comparable,
    weight: WeightFn[T],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[T, dict[T, int], dict[T, list[T]]]: ...


def _dijkstra[T](
    G: Edges[T],
    source: T,
    target: Comparable | None,
    weight: WeightFn[T],
    *,
    with_path=False,
    with_all_paths=False,
) -> tuple[T | None, dict[T, int], dict[T, list[T]]]:
    distance: dict[T, int] = {}
    seen: dict[T, int] = {}
    previous: dict[T, list[T]] = {}

    end = None
    heap = [(0, source)]
    while heap:
        d, cur = heappop(heap)

        if cur in distance:
            continue
        distance[cur] = d
        if with_all_paths and end is not None and d > distance[end]:
            break
        if cur == target:
            end = cur
            if not with_all_paths:
                break

        for neighbor in G[cur]:
            nd = d + weight(cur, neighbor)
            if neighbor in distance:
                if with_all_paths and nd == distance[neighbor]:
                    previous[neighbor].append(cur)
            elif neighbor not in seen or nd < seen[neighbor]:
                seen[neighbor] = nd
                heappush(heap, (nd, neighbor))
                if with_path or with_all_paths:
                    previous[neighbor] = [cur]
            elif with_all_paths and nd == seen[neighbor]:
                previous[neighbor].append(cur)

    return end, distance, previous
