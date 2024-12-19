from bisect import bisect_left
from collections.abc import Iterable

from aoc import main
from coords import Point, neighbors
from graph_dyn import DiGraph, shortest_path_length
from parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> Point:
    x, y = all_numbers(line)
    return x, y


class Memory(DiGraph):
    def __init__(self, size, boxes: Iterable[Point]):
        self.size = size
        self.boxes = set(boxes)

    def __contains__(self, node: Point) -> bool:
        x, y = node
        return 0 <= x < self.size and 0 <= y < self.size

    def __getitem__(self, node: Point) -> set[Point]:
        return {n for n in neighbors(node) if n in self and n not in self.boxes}


def minimum_steps(s: str, size: int, first: int) -> int:
    bytes = parse(s)
    start, goal = (0, 0), (size - 1, size - 1)
    return shortest_path_length(Memory(size, bytes[:first]), start, goal)


def first_cutoff_byte(s: str, size: int, first: int) -> str:
    bytes = parse(s)
    start, goal = (0, 0), (size - 1, size - 1)

    def bisect_key(i: int) -> bool:
        return shortest_path_length(Memory(size, bytes[: i + 1]), start, goal) == -1

    i = bisect_left(range(len(bytes)), True, lo=first, key=bisect_key)
    return f"{bytes[i][0]},{bytes[i][1]}"


if __name__ == "__main__":
    main(minimum_steps, first_cutoff_byte)
