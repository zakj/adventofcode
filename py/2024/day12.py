from itertools import combinations

from aoc import main
from coords import Dir, Dir8, Grid, Point, addp, neighbors


def parse(s: str):
    pass


def part1(s: str) -> int:
    grid = Grid(s)
    types = sorted(set(grid.data.values()))
    regions = {}
    for type in types:
        regions[type] = rr = []
        # saved = []
        for point in grid.findall(type):
            added = False
            for region in rr:
                if set(neighbors(point)) & region:
                    # if point == (13, 31):
                    #     saved.append(region)
                    added = True
                    region.add(point)
                    # if point == (13, 31):
                    #     print(region)
            if not added:
                rr.append({point})
        # if saved:
        #     print("->", saved)
        while True:
            changed = False
            for a, b in combinations(rr, 2):
                if a & b:
                    changed = True
                    a |= b
                    b.clear()
                regions[type] = rr = [s for s in rr if s]
            if not changed:
                break

    total = 0
    total_area = 0
    seen = set()
    for type, type_regions in regions.items():
        for region in type_regions:
            # if (13, 31) in region:
            #     print(type, region)
            # if seen & region:
            #     print(type, region, seen & region)
            #     raise Exception("wat")
            seen |= region
            area = len(region)
            total_area += area
            perimeter = 0
            for p in region:
                perimeter += len(set(neighbors(p)) - region)
            # if type == "F":
            #     print(type, area, perimeter)
            total += area * perimeter
    # print(total_area)
    # print(grid)
    return total


def part2(s: str) -> int:
    grid = Grid(s)
    types = sorted(set(grid.data.values()))
    regions = {}
    for type in types:
        regions[type] = rr = []
        for point in grid.findall(type):
            added = False
            for region in rr:
                if set(neighbors(point)) & region:
                    added = True
                    region.add(point)
            if not added:
                rr.append({point})
        while True:
            changed = False
            for a, b in combinations(rr, 2):
                if a & b:
                    changed = True
                    a |= b
                    b.clear()
                regions[type] = rr = [s for s in rr if s]
            if not changed:
                break

    total = 0
    for type, type_regions in regions.items():
        for region in type_regions:
            area = len(region)
            sides = count_corners(region)
            total += area * sides
    return total


def count_corners(region: set[Point]) -> int:
    """
    .......
    .EEEEE.
    .E.....
    .EEEEE.
    .E.....
    .EEEEE.
    .......
    """
    corners = 0
    for p in region:
        if not set([addp(p, Dir.N), addp(p, Dir.E)]) & region:
            corners += 1
        if not set([addp(p, Dir.E), addp(p, Dir.S)]) & region:
            corners += 1
        if not set([addp(p, Dir.N), addp(p, Dir.W)]) & region:
            corners += 1
        if not set([addp(p, Dir.W), addp(p, Dir.S)]) & region:
            corners += 1
        if (
            addp(p, Dir.N) in region
            and addp(p, Dir.E) in region
            and addp(p, Dir8.NE) not in region
        ):
            corners += 1

        if (
            addp(p, Dir.S) in region
            and addp(p, Dir.E) in region
            and addp(p, Dir8.SE) not in region
        ):
            corners += 1
        if (
            addp(p, Dir.S) in region
            and addp(p, Dir.W) in region
            and addp(p, Dir8.SW) not in region
        ):
            corners += 1
        if (
            addp(p, Dir.N) in region
            and addp(p, Dir.W) in region
            and addp(p, Dir8.NW) not in region
        ):
            corners += 1

    return corners


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=0,
    )
