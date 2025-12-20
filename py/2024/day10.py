from aoc import main
from aoc.coords import Dir, Grid, Point
from aoc.graph import Edges, shortest_path_length


class Map:
    def __init__(self, s: str):
        self.grid = Grid(s, int)
        self.trailheads = set(self.grid.findall(0))
        self.trailends = set(self.grid.findall(9))

    def __getitem__(self, p: Point) -> set[Point]:
        return {n for n in Dir.neighbors(p) if self.grid[p] + 1 == self.grid.get(n)}


def trail_score(s: str) -> int:
    G = Map(s)
    return sum(
        len({p for p in shortest_path_length(G, start) if p in G.trailends})
        for start in G.trailheads
    )


# TODO: factor into graph lib?
def all_paths(G: Edges, starts, ends):
    queue = [(start, [start]) for start in starts]
    while queue:
        cur, path = queue.pop()
        if cur in ends:
            yield path
        for neighbor in G[cur]:
            if neighbor not in path:
                queue.append((neighbor, [*path, neighbor]))


def trail_rating(s: str) -> int:
    G = Map(s)
    return len(list(all_paths(G, G.trailheads, G.trailends)))


if __name__ == "__main__":
    main(trail_score, trail_rating)
