from bisect import bisect, insort
from collections import defaultdict

from aoc import main
from coords import Dir, Grid, Point, Vector, addp, subp, turn_right

State = tuple[Point, Vector]
Visits = dict[Point, list[Vector]]
Obstacles = dict[int, list[int]]


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
    obs_by_x = defaultdict[int, list[int]](list)
    obs_by_y = defaultdict[int, list[int]](list)
    for x, y in grid.findall("#"):
        obs_by_x[x].append(y)
        obs_by_y[y].append(x)

    # Optimization: start the walk from the point/dir at which we would have
    # first encountered this obstacle, to save us repeating steps walking
    # from the original start.
    visits = walk(grid, start)
    count = 0
    for x, y in set(visits.keys()) - {start[0]}:
        insort(obs_by_x[x], y)
        insort(obs_by_y[y], x)
        dir = visits[x, y][0]
        start = subp((x, y), dir)
        if has_loop(grid, (start, turn_right(dir)), obs_by_x, obs_by_y):
            count += 1
        obs_by_x[x].remove(y)
        obs_by_y[y].remove(x)
    return count


# Optimization: rather than walking through the grid step by step, quickly find
# the next obstacle in the current direction and hop to it.
def has_loop(
    grid: Grid, start: State, obs_by_x: Obstacles, obs_by_y: Obstacles
) -> bool:
    visits: Visits = defaultdict(list)
    (x, y), dir = start
    while (x, y) in grid:
        if dir in visits[x, y]:
            return True
        visits[x, y].append(dir)

        horizontal = dir in {Dir.E, Dir.W}
        obstacles = obs_by_y[y] if horizontal else obs_by_x[x]
        value = x if horizontal else y
        idx = bisect(obstacles, value) - (1 if dir in {Dir.W, Dir.N} else 0)
        if not 0 <= idx < len(obstacles):
            break
        obs = (obstacles[idx], y) if horizontal else (x, obstacles[idx])

        x, y = subp(obs, dir)
        dir = turn_right(dir)
    return False


if __name__ == "__main__":
    main(visited_positions, count_looping_obstacles)
