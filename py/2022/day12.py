from aoc import main
from coords import Grid, Point, neighbors
from graph_dyn import DiGraph, Goal, shortest_path_length


# TODO consider supporting multiple starts in _dijkstra so I don't have to do
# this inverted hack.
class ReversedHeightMap(DiGraph):
    def __init__(self, s: str):
        self.grid = Grid(s)
        self.start = self.grid.findall("E")[0]

    def __getitem__(self, node: Point) -> set[Point]:
        h = self.height(node)
        return {
            n for n in neighbors(node) if n in self.grid and h - 1 <= self.height(n)
        }

    def height(self, point: Point) -> int:
        c = self.grid[point]
        return ord({"S": "a", "E": "z"}.get(c, c))


def to_start(s: str) -> int:
    G = ReversedHeightMap(s)
    end = G.grid.findall("S")[0]
    return shortest_path_length(G, G.start, end)


def to_any_a(s: str) -> int:
    G = ReversedHeightMap(s)
    goal = Goal[Point](lambda n: G.grid[n] in "Sa")
    return shortest_path_length(G, G.start, goal)


if __name__ == "__main__":
    main(to_start, to_any_a)
