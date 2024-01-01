from aoc import main
from coords import Point
from graph import GridGraph, shortest_path_length, shortest_path_lengths_from


def build_inverse_graph(s: str) -> GridGraph:
    height = lambda c: ord({"S": "a", "E": "z"}.get(c, c))

    def edgeweight(src: Point, stype: str, dst: Point, dtype: str) -> bool:
        return height(stype) - 1 <= height(dtype)

    return GridGraph(s, edgeweight)


def to_start(s: str) -> int:
    G = build_inverse_graph(s)
    start = next(n for n, c in G.type.items() if c == "S")
    end = next(n for n, c in G.type.items() if c == "E")
    return shortest_path_length(G, end, start)


def to_any_a(s: str) -> int:
    G = build_inverse_graph(s)
    end = next(n for n, c in G.type.items() if c == "E")
    return min(d for n, d in shortest_path_lengths_from(G, end) if G.type[n] in "Sa")


if __name__ == "__main__":
    main(to_start, to_any_a)
