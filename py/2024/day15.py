from aoc import main
from aoc.coords import Dir, Grid, Point, Vector, addp


def parse(
    s: str, cmap: dict[str, str] | None = None
) -> tuple[Grid, list[Vector], Point]:
    map, moves = s.split("\n\n")
    if cmap is not None:
        map = "".join([cmap.get(c, c) for c in map])
    grid = Grid(map)
    return grid, [Dir.parse(c) for c in moves.replace("\n", "")], grid.find("@")


def gps_coordinates(s: str) -> int:
    grid, moves, robot = parse(s)
    grid[robot] = "."

    for dir in moves:
        to = addp(robot, dir)
        if grid[to] == "#":
            continue
        if grid[to] != "O":
            robot = to
            continue

        # something to push
        check = to
        while grid[check] == "O":
            check = addp(check, dir)
        if grid[check] == "#":
            continue

        robot = to
        grid[to] = "."
        grid[check] = "O"

    return sum(x + y * 100 for x, y in grid.findall("O"))


wide_map = {
    "#": "##",
    "O": "[]",
    ".": "..",
    "@": "@.",
}


class Blocked(Exception):
    pass


def boxes_pushed_by(grid: Grid, box: Point, dir: Vector) -> set[Point]:
    pushing = {box, addp(box, Dir.E if grid[box] == "[" else Dir.W)}
    destination = {addp(p, dir) for p in pushing} - pushing
    for p in destination:
        if grid[p] == "#":
            raise Blocked
        if grid[p] == ".":
            continue
        pushing |= boxes_pushed_by(grid, p, dir)
    return pushing


def wide_gps_coordinates(s: str) -> int:
    grid, boxes, robot = parse(s, wide_map)
    grid[robot] = "."
    for dir in boxes:
        to = addp(robot, dir)
        if grid[to] == ".":
            robot = to
            continue
        if grid[to] == "#":
            continue
        try:
            boxes = boxes_pushed_by(grid, to, dir)
        except Blocked:
            continue

        robot = to
        box_destinations = []
        for p in boxes:
            box_destinations.append((addp(p, dir), grid[p]))
            grid[p] = "."
        for p, c in box_destinations:
            grid[p] = c

    return sum(x + y * 100 for x, y in grid.findall("["))


if __name__ == "__main__":
    main(gps_coordinates, wide_gps_coordinates)
