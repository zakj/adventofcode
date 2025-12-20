from aoc import main
from aoc.coords import Dir, Dir8, Grid, Point, addp
from aoc.graph import IterableEdges, shortest_path_length


class Farm:
    def __init__(self, s: str):
        self.grid = Grid(s)

    def __iter__(self):
        return iter(self.grid.data)

    def __getitem__(self, point: Point) -> set[Point]:
        return {n for n in Dir.neighbors(point) if self.grid[point] == self.grid.get(n)}


def find_regions(G: IterableEdges[Point]) -> list[set[Point]]:
    seen = set()
    regions = []
    for point in G:
        if point in seen:
            continue
        region = set(shortest_path_length(G, point))
        seen |= region
        regions.append(region)
    return regions


def price_by_perimeter(s: str) -> int:
    G = Farm(s)
    regions = find_regions(G)

    total = 0
    for region in regions:
        area = len(region)
        perimeter = sum(4 - len(set(G[p])) for p in region)
        total += area * perimeter
    return total


def price_by_sides(s: str) -> int:
    G = Farm(s)
    regions = find_regions(G)

    total = 0
    for region in regions:
        area = len(region)
        sides = count_corners(region)
        total += area * sides
    return total


def count_corners(region: set[Point]) -> int:
    defs = [
        (Dir.N, Dir.E, Dir8.NE),
        (Dir.E, Dir.S, Dir8.SE),
        (Dir.S, Dir.W, Dir8.SW),
        (Dir.W, Dir.N, Dir8.NW),
    ]

    corners = 0
    for p in region:
        for a, b, diag in defs:
            a, b, diag = addp(p, a), addp(p, b), addp(p, diag)
            if a not in region and b not in region:
                corners += 1
            elif a in region and b in region and diag not in region:
                corners += 1
    return corners


if __name__ == "__main__":
    main(price_by_perimeter, price_by_sides)
