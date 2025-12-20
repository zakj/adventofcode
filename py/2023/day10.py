from collections.abc import Iterable

from aoc import main
from aoc.coords import Dir, Grid, Point, Vector, addp, opposite
from aoc.graph import shortest_path_length

PIPES: dict[str, set[Vector]] = {
    "|": set([Dir.N, Dir.S]),
    "-": set([Dir.W, Dir.E]),
    "L": set([Dir.N, Dir.E]),
    "J": set([Dir.N, Dir.W]),
    "7": set([Dir.S, Dir.W]),
    "F": set([Dir.S, Dir.E]),
    "S": set(Dir),
    ".": set(),
}


class Pipes:
    def __init__(self, s: str):
        self.grid = Grid(s)
        self.start = self.grid.find("S")

    def __iter__(self):
        return iter(self.grid.data)

    def __getitem__(self, point: Point) -> set[Point]:
        candidates = {(dir, addp(point, dir)) for dir in PIPES[self.grid[point]]}
        return {
            n
            for d, n in candidates
            if n in self.grid and opposite(d) in PIPES[self.grid[n]]
        }


def farthest_from_start(s: str) -> int:
    G = Pipes(s)
    return max(d for p, d in shortest_path_length(G, G.start).items())


def ray_northwest(x: int, y: int) -> Iterable[Point]:
    while x > 0 and y > 0:
        x -= 1
        y -= 1
        yield (x, y)


def enclosed(s: str) -> int:
    G = Pipes(s)
    loop = {n for n, _ in shortest_path_length(G, G.start).items()}
    valid_crossings = {n for n in loop if G.grid[n] not in "7L"}
    enclosed = 0
    for x, y in set(G) - loop:
        crossings = len([n for n in ray_northwest(x, y) if n in valid_crossings])
        if crossings % 2 == 1:
            enclosed += 1
    return enclosed


if __name__ == "__main__":
    main(farthest_from_start, enclosed)
