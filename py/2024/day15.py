from aoc import main
from coords import Dir, Grid, Point, Vector, addp


def parse(
    s: str, cmap: dict[str, str] | None = None
) -> tuple[Grid, list[Vector], Point]:
    map, moves = s.split("\n\n")
    if cmap is not None:
        map = "".join([cmap.get(c, c) for c in map])
    grid = Grid(map)
    return grid, [Dir.parse(c) for c in moves.replace("\n", "")], grid.findall("@")[0]


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


def boxes_pushed_by(grid: Grid, box: Point, dir: Vector) -> set[Point]:
    pushing = {box}
    if grid[box] == "[":
        pushing.add(addp(box, Dir.E))
    elif grid[box] == "]":
        pushing.add(addp(box, Dir.W))
    destination = {addp(p, dir) for p in pushing} - pushing
    if any(grid[p] == "#" for p in destination):
        return set()
    for p in destination:
        if grid[p] == ".":
            continue
        new_moves = boxes_pushed_by(grid, p, dir)
        if not new_moves:
            return set()
        pushing |= new_moves
    return pushing


def wide_gps_coordinates(s: str) -> int:
    grid, boxes, robot = parse(s, wide_map)
    grid[robot] = "."
    for dir in boxes:
        to = addp(robot, dir)
        if grid[to] == "#":
            continue
        if grid[to] not in "[]":
            robot = to
            continue
        boxes = boxes_pushed_by(grid, to, dir)
        if not boxes:
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
