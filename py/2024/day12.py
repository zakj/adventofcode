from aoc import main
from coords import Dir, Dir8, Point, addp
from graph import GridGraph, all_reachable_points_from


def parse(s: str) -> GridGraph:
    def edges(a: Point, ac: str, b: Point, bc: str) -> bool:
        return ac == bc

    return GridGraph(s, edges)


def find_regions(G: GridGraph) -> list[set[Point]]:
    seen = set()
    regions = []
    for point in G:
        if point in seen:
            continue
        region = all_reachable_points_from(G, point)
        seen |= region
        regions.append(region)
    return regions


def price_by_perimeter(s: str) -> int:
    G = parse(s)
    regions = find_regions(G)

    total = 0
    for region in regions:
        area = len(region)
        perimeter = sum(4 - len(set(G[p])) for p in region)
        total += area * perimeter
    return total


def price_by_sides(s: str) -> int:
    G = parse(s)
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
