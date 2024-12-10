from itertools import product

from aoc import main
from coords import Point
from graph import GridGraph, all_paths, shortest_path_lengths_from


def parse(s: str) -> tuple[GridGraph, list[Point]]:
    def edges(pa: Point, ca: str, pb: Point, cb: str) -> bool:
        return int(ca) + 1 == int(cb)

    G = GridGraph(s, edges)
    return G, [p for p, c in G.type.items() if c == "0"]


def trail_score(s: str) -> int:
    G, trailheads = parse(s)
    score = 0
    for start in trailheads:
        score += len([1 for _, d in shortest_path_lengths_from(G, start) if d == 9])
    return score


def trail_rating(s: str) -> int:
    G, trailheads = parse(s)
    trailends = [p for p, c in G.type.items() if c == "9"]
    rating = 0
    for start, end in product(trailheads, trailends):
        rating += len(list(all_paths(G, start, end)))
    return rating


if __name__ == "__main__":
    main(trail_score, trail_rating)
