from aoc import main, progress
from aoc.coords import Dir, Grid, Point, mdist
from aoc.graph_dyn import DiGraph, shortest_path_length


class Racetrack(DiGraph):
    def __init__(self, s: str):
        self.grid = Grid(s)
        self.start = self.grid.find("S")
        self.end = self.grid.find("E")
        self.track = set(self.grid.findall(".")) | {self.start, self.end}

    def __iter__(self):
        return iter(self.grid.data)

    def __getitem__(self, node: Point) -> set[Point]:
        return {n for n in Dir.neighbors(node) if n in self.track}


def cheat_neighbors(p: Point, max: int) -> set[Point]:
    x, y = p
    return {
        (x + dx, y + dy)
        for dy in range(-max, max + 1)
        for dx in range(-(max - abs(dy)), (max - abs(dy)) + 1)
    }


def count_cheats(s: str, target_savings: int, cheat_distance: int) -> int:
    G = Racetrack(s)
    distance = shortest_path_length(G, G.end)
    cheats = 0
    for cur, dcur in progress(distance.items()):
        for n in cheat_neighbors(cur, cheat_distance) & G.track:
            dn = distance[n]
            if dcur > dn and dcur - dn - mdist(cur, n) >= target_savings:
                cheats += 1
    return cheats


if __name__ == "__main__":
    main(
        lambda s, target_savings: count_cheats(s, target_savings, 2),
        lambda s, target_savings: count_cheats(s, target_savings, 20),
    )
