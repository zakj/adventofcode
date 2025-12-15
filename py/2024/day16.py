from aoc import main
from aoc.coords import Dir, Grid, Point, Vector, addp, turn_left, turn_right
from aoc.graph_dyn import Goal, all_shortest_paths, shortest_path_length

type Node = tuple[Point, Vector]


class Maze:
    def __init__(self, s: str):
        grid = Grid(s)
        self.start = grid.find("S")
        self.end = grid.find("E")
        self.walkable = set(grid.findall("."))
        self.walkable |= {self.start, self.end}

    def __getitem__(self, node: Node) -> set[Node]:
        p, dir = node
        right, left = turn_right(dir), turn_left(dir)
        edges = [
            (addp(p, dir), dir),
            (addp(p, left), left),
            (addp(p, right), right),
        ]
        return {(p, dir) for p, dir in edges if p in self.walkable}

    def weight(self, a: Node, b: Node) -> int:
        return 1 if a[1] == b[1] else 1001


def lowest_reindeer_score(s: str) -> int:
    G = Maze(s)
    goal = Goal[Node](lambda node: node[0] == G.end)
    return shortest_path_length(G, (G.start, Dir.E), goal, weight=G.weight)


def count_best_seats(s: str) -> int:
    G = Maze(s)
    goal = Goal[Node](lambda node: node[0] == G.end)
    seats = set()
    # TODO: would A* be faster? maybe not, because of dead ends
    for path in all_shortest_paths(G, (G.start, Dir.E), goal, weight=G.weight):
        seats |= {p for p, _ in path}
    return len(seats)


if __name__ == "__main__":
    main(lowest_reindeer_score, count_best_seats)
