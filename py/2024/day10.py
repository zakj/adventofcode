from aoc import main, status
from coords import Point
from graph import (
    GridGraph,
    all_shortest_path_lengths,
    shortest_path_length,
    shortest_path_lengths_from,
)


def parse(s: str):
    pass


def part1(s: str) -> int:
    def edges(pa: Point, ca: str, pb: Point, cb: str) -> bool:
        return int(ca) + 1 == int(cb)

    G = GridGraph(s, edges)

    trailheads = [p for p, c in G.type.items() if c == "0"]
    score = 0
    for i, start in enumerate(trailheads):
        score += len(
            [
                1
                for point, distance in shortest_path_lengths_from(G, start)
                if G.type[point] == "9"
            ]
        )
    return score


def part2(s: str) -> int:
    def edges(pa: Point, ca: str, pb: Point, cb: str) -> bool:
        return int(ca) + 1 == int(cb)

    G = GridGraph(s, edges)

    trailheads = [p for p, c in G.type.items() if c == "0"]
    trailends = [p for p, c in G.type.items() if c == "9"]
    score = 0
    for i, start in enumerate(trailheads):
        status(f"{i + 1} / {len(trailheads)}")
        for end in trailends:
            score += len(list(all_paths(G, start, end, set())))
    return score


def all_paths(G, start: Point, end: Point, visited: set[Point]):
    visited.add(start)
    if start == end:
        yield 1
    else:
        for neighbor in G[start] - visited:
            yield from all_paths(G, neighbor, end, visited)
    visited.remove(start)


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
