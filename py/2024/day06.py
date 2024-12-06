from aoc import main
from coords import Dir, Grid, Point, Vector, addp, subp, turn_right

State = tuple[Point, Vector]


def parse(s: str) -> tuple[Grid, State]:
    grid = Grid(s)
    return grid, (grid.findall("^")[0], Dir.N)


def walk(grid: Grid, start: State) -> tuple[bool, set[tuple[Point, Vector]]]:
    seen = set()
    cur, dir = start
    while cur in grid:
        if (cur, dir) in seen:
            return True, seen
        seen.add((cur, dir))
        cur = addp(cur, dir)
        while grid.get(cur) == "#":
            cur = subp(cur, dir)
            dir = turn_right(dir)
    return False, seen


def visited_positions(s: str) -> int:
    grid, start = parse(s)
    _, seen = walk(grid, start)
    return len({p for p, d in seen})


def count_looping_obstacles(s: str) -> int:
    grid, start = parse(s)
    _, seen = walk(grid, start)
    obstacle_options = {p for p, d in seen} - {start[0]}
    count = 0
    for point in obstacle_options:
        grid[point] = "#"
        if walk(grid, start)[0]:
            count += 1
        grid[point] = "."
    return count


if __name__ == "__main__":
    main(visited_positions, count_looping_obstacles)
