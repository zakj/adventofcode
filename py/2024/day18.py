from bisect import bisect_left

from aoc import main
from coords import Point
from graph import DiGraph, GridGraph, shortest_path_length
from parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> Point:
    x, y = all_numbers(line)
    return x, y


def make_graph(size: int, bytes: list[Point]) -> DiGraph[Point]:
    row = "." * size
    rows = "\n".join([row] * size)
    bytes_set = set(bytes)

    def edges(a: Point, ac: str, b: Point, bc: str) -> bool:
        return b not in bytes_set

    return GridGraph(rows, edges)


def minimum_steps(s: str, size: int, first: int) -> int:
    bytes = parse(s)
    start, goal = (0, 0), (size - 1, size - 1)
    G = make_graph(size, bytes[:first])
    return shortest_path_length(G, start, goal)


def first_cutoff_byte(s: str, size: int, first: int) -> str:
    bytes = parse(s)
    start, goal = (0, 0), (size - 1, size - 1)

    def bisect_key(i: int) -> bool:
        G = make_graph(size, bytes[: i + 1])
        return shortest_path_length(G, start, goal) == -1

    i = bisect_left(list(range(len(bytes))), True, lo=first, key=bisect_key)
    return f"{bytes[i][0]},{bytes[i][1]}"


if __name__ == "__main__":
    main(minimum_steps, first_cutoff_byte)
