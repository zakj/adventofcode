from collections import defaultdict

from aoc import main
from coords import Dir, Grid, Point, Vector, addp, subp, turn_right

State = tuple[Point, Vector]
Visits = dict[Point, list[Vector]]


class FoundLoop(Exception):
    pass


def parse(s: str) -> tuple[Grid[str], State]:
    grid = Grid(s)
    return grid, (grid.findall("^")[0], Dir.N)


def walk(grid: Grid, start: State) -> Visits:
    visits: Visits = defaultdict(list)
    cur, dir = start
    while cur in grid:
        if dir in visits[cur]:
            raise FoundLoop
        visits[cur].append(dir)
        cur = addp(cur, dir)
        while grid.get(cur) == "#":
            cur = subp(cur, dir)
            dir = turn_right(dir)
    return visits


def visited_positions(s: str) -> int:
    grid, start = parse(s)
    visits = walk(grid, start)
    return len(visits)


def count_looping_obstacles(s: str) -> int:
    grid, start = parse(s)
    visits = walk(grid, start)
    count = 0
    for obstacle in set(visits.keys()) - {start[0]}:
        grid[obstacle] = "#"
        # Optimization: start the walk from the point/dir at which we would have
        # first encountered this obstacle, to save us repeating steps walking
        # from the original start.
        dir = visits[obstacle][0]
        start = subp(obstacle, dir)
        try:
            walk(grid, (start, dir))
        except FoundLoop:
            count += 1
        grid[obstacle] = "."
    return count


if __name__ == "__main__":
    main(visited_positions, count_looping_obstacles)
