from aoc import main
from coords import Dir, Grid, addp, subp, turn_right


def parse(s: str):
    pass


def part1(s: str) -> int:
    grid = Grid(s)
    start = grid.findall("^")[0]
    seen = {start}
    dir = Dir.N
    cur = start
    while True:
        next = addp(cur, dir)
        if next not in grid:
            break
        if grid[next] == "#":
            dir = turn_right(dir)
            next = addp(cur, dir)
        if next not in grid:
            break
        seen.add(next)
        cur = next
    return len(seen)


def path(grid, cur):
    dir = Dir.N
    seen = {(cur, dir)}
    while True:
        next = addp(cur, dir)
        if next not in grid:
            break
        if grid[next] == "#":
            dir = turn_right(dir)
            next = addp(cur, dir)
        if next not in grid:
            break
        seen.add((next, dir))
        cur = next
    return {a for a, b in seen}


def walk(grid, cur):
    dir = Dir.N
    seen = set()
    while cur in grid:
        if grid[cur] == "#":
            cur = subp(cur, dir)
            dir = turn_right(dir)
            continue
        if (cur, dir) in seen:
            return True
        seen.add((cur, dir))
        cur = addp(cur, dir)
    return False


def part2(s: str) -> int:
    grid = Grid(s)
    start = grid.findall("^")[0]
    options = path(grid, start)
    total = set()
    grid = Grid(s)
    for option in options - {start}:
        grid[option] = "#"
        if walk(grid, start):
            total.add(option)
        grid[option] = "."
    return len(total)


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
