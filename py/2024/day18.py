from itertools import count

from aoc import main
from coords import Grid, Point, neighbors
from graph import GridGraph, shortest_path_length
from parse import all_numbers


class Grid2(Grid):
    def display2(self) -> str:
        rows = []
        for y in range(self.height):
            rows.append("".join(str(self[x, y]) for x in range(self.width)))
        return "\n".join(rows)


def parse(s: str, size: int):
    row = "." * size
    rows = [row] * size
    grid = Grid2("\n".join(rows))
    bytes = []
    for line in s.splitlines():
        x, y = all_numbers(line)
        bytes.append((x, y))
    return grid, bytes


def part1(s: str, size: int, first: int) -> int:
    grid, bytes = parse(s, size)
    bytes = bytes[:first]
    start = (0, 0)
    positions = {start}
    queue = [(start, 0)]
    goal = (size - 1, size - 1)
    for byte in bytes:
        grid[byte] = "#"

    def edges(a: Point, ac: str, b: Point, bc: str) -> bool:
        return bc != "#"

    G = GridGraph(grid.display2(), edges)
    return shortest_path_length(G, start, goal)
    for t in count():
        newpos = set()
        for cur in positions:
            if cur == goal:
                return t
            for neighbor in neighbors(cur):
                if neighbor in grid and grid[neighbor] != "#":
                    newpos.add(neighbor)
        positions = newpos
    # not 138
    return 0


def part2(s: str, size: int, first: int) -> str:
    grid, bytes = parse(s, size)
    start = (0, 0)
    goal = (size - 1, size - 1)
    for byte in bytes[:first]:
        grid[byte] = "#"

    def edges(a: Point, ac: str, b: Point, bc: str) -> bool:
        return bc != "#"

    G = GridGraph(grid.display2(), edges)

    for t in bytes[first:]:
        G.remove_node(t)
        if shortest_path_length(G, start, goal) == -1:
            return f"{t[0]},{t[1]}"

    raise ValueError


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
