from aoc import main
from coords import Point
from graph import GridGraph, all_paths_by, shortest_path_lengths_from


def parse(s: str) -> tuple[GridGraph, list[Point]]:
    def edges(pa: Point, ca: str, pb: Point, cb: str) -> bool:
        return int(ca) + 1 == int(cb)

    G = GridGraph(s, edges)
    return G, [p for p, c in G.type.items() if c == "0"]


def trail_score(s: str) -> int:
    G, trailheads = parse(s)
    return sum(
        len([1 for _, d in shortest_path_lengths_from(G, start) if d == 9])
        for start in trailheads
    )


def trail_rating(s: str) -> int:
    G, trailheads = parse(s)
    trailends = {p for p, c in G.type.items() if c == "9"}
    return sum(
        len(list(all_paths_by(G, start, lambda p: p in trailends)))
        for start in trailheads
    )


if __name__ == "__main__":
    main(trail_score, trail_rating)
