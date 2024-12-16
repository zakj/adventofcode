from collections.abc import Callable, Generator, Iterable
from heapq import heappop, heappush
from math import inf

from aoc import main
from coords import Dir, Grid, Point, Vector, addp, mdist, turn_left, turn_right

Node = tuple[Point, Vector]


def parse(s: str):
    G = Grid(s)
    start = G.findall("S")[0], Dir.E
    endp = G.findall("E")[0]
    end = {(endp, dir) for dir in Dir}

    def edges(node: Node) -> Iterable[tuple[Node, int]]:
        p, dir = node
        right, left = turn_right(dir), turn_left(dir)
        edges = [
            (addp(p, dir), dir, 1),
            (addp(p, left), left, 1001),
            (addp(p, right), right, 1001),
        ]
        for np, nd, weight in edges:
            if G[np] != "#":
                yield (np, nd), weight

    def heuristic(node: Node) -> int:
        return mdist(node[0], endp)

    return start, end, edges, heuristic


def lowest_reindeer_score(s: str) -> int:
    distance, path = shortest_weighted_path(*parse(s))
    return distance


def count_best_seats(s: str) -> int:
    paths = set()
    for distance, path in shortest_weighted_paths(*parse(s)):
        paths |= {p for p, d in path}
    return len(paths)


# TODO: factor these out into graph.py
def shortest_weighted_path[T](
    start: T,
    goal: set[T],
    edges: Callable[[T], Iterable[tuple[T, int]]],
    heuristic: Callable[[T], int] = lambda _: 0,
) -> tuple[int, list[T]]:
    queue: list[tuple[int, T, list[T]]] = [(0, start, [start])]
    distance = {start: 0}
    while queue:
        _, cur, path = heappop(queue)
        if cur in goal:
            return distance[cur], path
        for node, weight in edges(cur):
            d = distance[cur] + weight
            if node in distance and distance[node] <= d:
                continue
            distance[node] = d
            heappush(queue, (heuristic(node) + d, node, path + [node]))
    return -1, []


def shortest_weighted_paths[T](
    start: T,
    goal: set[T],
    edges: Callable[[T], Iterable[tuple[T, int]]],
    heuristic: Callable[[T], int] = lambda _: 0,
) -> Generator[tuple[int, list[T]]]:
    queue: list[tuple[int, T, list[T]]] = [(0, start, [start])]
    distance = {start: 0}
    best_goal = inf
    while queue:
        _, cur, path = heappop(queue)
        if cur in goal:
            yield distance[cur], path
            best_goal = min(distance[cur], best_goal)
            continue
        for node, weight in edges(cur):
            d = distance[cur] + weight
            if d > best_goal or (node in distance and distance[node] < d):
                continue
            distance[node] = d
            heappush(queue, (heuristic(node) + d, node, path + [node]))


if __name__ == "__main__":
    main(lowest_reindeer_score, count_best_seats)
