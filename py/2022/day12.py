from aoc import main
from coords import Point
from graph import DiGraph, shortest_path_length, shortest_path_lengths_from


def build_inverse_graph(s: str) -> DiGraph[Point]:
    height = lambda c: ord({"S": "a", "E": "z"}.get(c, c))

    def edgeweight(from_node, from_data, to_node, to_data) -> bool:
        return from_data["height"] - 1 <= to_data["height"]

    def attrs(c: str) -> dict:
        return {"label": c, "height": height(c)}

    return DiGraph.from_grid(s, edgeweight, attrs)


def to_start(s: str) -> int:
    G = build_inverse_graph(s)
    start = next(n for n, c in G.attr("label") if c == "S")
    end = next(n for n, c in G.attr("label") if c == "E")
    return shortest_path_length(G, end, start)


def to_any_a(s: str) -> int:
    G = build_inverse_graph(s)
    end = next(n for n, c in G.attr("label") if c == "E")
    return min(
        d for n, d in shortest_path_lengths_from(G, end) if G.nodes[n]["label"] in "Sa"
    )


if __name__ == "__main__":
    main(to_start, to_any_a)
