from heapq import heappop, heappush

from aoc import main
from coords import Dir, Grid, addp, mdist, turn_left, turn_right


def parse(s: str):
    pass


def part1(s: str) -> int:
    G = Grid(s)
    start = G.findall("S")[0]
    end = G.findall("E")[0]
    queue = [(mdist(start, end), 0, start, Dir.E)]
    visited = set()
    while queue:
        _, points, cur, dir = heappop(queue)
        if cur == end:
            return points
        if (cur, dir) in visited:
            continue
        visited.add((cur, dir))
        straight = addp(cur, dir)
        if G[straight] != "#":
            heappush(
                queue, (mdist(straight, end) + points + 1, points + 1, straight, dir)
            )
        for ndir in [turn_right(dir), turn_left(dir)]:
            heappush(queue, (mdist(cur, end) + points + 1000, points + 1000, cur, ndir))
    return 0


def part2(s: str) -> int:
    G = Grid(s)
    start = G.findall("S")[0]
    end = G.findall("E")[0]
    queue = [(mdist(start, end), 0, start, Dir.E, set())]
    best_path = set()
    best_points = None
    best_at = {}
    while queue:
        _, points, cur, dir, visited = heappop(queue)
        if (cur, dir) in visited:
            continue
        visited = visited | {(cur, dir)}
        if best_at.get((cur, dir), 100000000000000) < points:
            continue
        best_at[(cur, dir)] = points
        if cur == end:
            if best_points is None or points == best_points:
                best_points = points
                best_path |= {p for p, d in visited}
            continue
        if best_points is not None and points > best_points:
            continue
        straight = addp(cur, dir)
        if G[straight] != "#":
            heappush(
                queue,
                (
                    mdist(straight, end) + points + 1,
                    points + 1,
                    straight,
                    dir,
                    visited,
                ),
            )
        for ndir in [turn_right(dir), turn_left(dir)]:
            heappush(
                queue,
                (
                    mdist(cur, end) + points + 1000,
                    points + 1000,
                    cur,
                    ndir,
                    visited,
                ),
            )
    return len(best_path)


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
