from collections import deque

from aoc import main
from coords import Dir, Grid, Point, Vector, addp
from parse import paras


def parse(s: str):
    pass


# def adjacent_boxes(p: Point, dir: Vector, boxes: list[Point], walls: list[Point]) -> set[Point]:
#     rv = []
#     j

#     pass


def display(grid: Grid, boxes, walls, robot):
    for y in range(grid.height):
        row = []
        for x in range(grid.width):
            if (x, y) in boxes:
                row.append("O")
            elif (x, y) in walls:
                row.append("#")
            elif (x, y) == robot:
                row.append("@")
            else:
                row.append(".")
        print("".join(row))


def part1(s: str) -> int:
    map_str, move_str = paras(s)
    grid = Grid("\n".join(map_str))
    moves = [Dir.parse(c) for c in "".join(move_str)]
    robot = grid.findall("@")[0]
    boxes = set(grid.findall("O"))
    walls = set(grid.findall("#"))
    nbox = len(boxes)
    for dir in moves:
        # display(grid, boxes, walls, robot)
        # print()
        # print(f"{dir=}")
        assert dir is not None
        np = addp(robot, dir)
        if np in walls:
            continue
        if np not in boxes:
            robot = np
            continue

        # something to push
        check = np
        while check in boxes:
            check = addp(check, dir)
        if check in walls:
            continue

        robot = np
        boxes.remove(np)
        boxes.add(check)
        assert len(boxes) == nbox

    return sum(x + y * 100 for x, y in boxes)


map = {
    "#": "##",
    "O": "[]",
    ".": "..",
    "@": "@.",
    "\n": "\n",
}

from dataclasses import astuple, dataclass


@dataclass
class Box:
    left: Point
    right: Point

    def move(self, dir: Vector) -> None:
        self.left = addp(self.left, dir)
        self.right = addp(self.right, dir)


def part2(s: str) -> int:
    map_str, move_str = paras(s)
    grid = Grid("".join([map[c] for c in "\n".join(map_str)]))
    moves = [Dir.parse(c) for c in "".join(move_str)]
    robot = grid.findall("@")[0]
    grid[robot] = "."
    # boxes_list = [Box(p, addp(p, Dir.E)) for p in grid.findall("O")]
    # boxes_set = {b.left for b in boxes_list}
    # boxes_set |= {b.right for b in boxes_list}
    # boxes = {}
    # walls = set(grid.findall("#"))
    # nbox = len(boxes)

    def moves_for(box: Point, dir: Vector) -> set[Point]:
        pushing = {box}
        if grid[box] == "[":
            pushing.add(addp(box, Dir.E))
        elif grid[box] == "]":
            pushing.add(addp(box, Dir.W))
        else:
            print(box, grid[box])
            assert False
        destination = {addp(p, dir) for p in pushing} - pushing
        if any(grid[p] == "#" for p in destination):
            return set()
        for p in destination:
            if grid[p] == ".":
                continue
            new_moves = moves_for(p, dir)
            if not new_moves:
                return set()
            pushing |= new_moves
        return pushing

    # def move(box: Point, dir: Vector) -> set[Point]:
    #     pushing = {box}
    #     if grid[box] == "[":
    #         pushing.add(addp(box, Dir.E))
    #     elif grid[box] == "]":
    #         pushing.add(addp(box, Dir.W))
    #     elif grid[box] == ".":
    #         return pushing
    #     else:
    #         print(box, grid[box])
    #         assert False

    #     destination = list({addp(p, dir) for p in pushing} - pushing)
    #     count = 0
    #     while destination:
    #         count += 1
    #         p = destination.pop()
    #         if grid[p] == "." or p in pushing:
    #             continue
    #         pushing.add(p)
    #         destination.append(addp(p, dir))
    #         if grid[p] == "[":
    #             destination.append(addp(p, Dir.E))
    #         elif grid[p] == "]":
    #             destination.append(addp(p, Dir.W))
    #         if count > 10:
    #             print(f"{destination=}")
    #         if count > 20:
    #             print(f"{destination=}")
    #             raise Exception("too big")
    #         # destination = {addp(p, dir) for p in pushing} - pushing
    #     return pushing

    for dir in moves:
        # print(f"{dir=}")
        # grid[robot] = "@"
        # grid.display()
        # grid[robot] = "."
        assert dir is not None
        np = addp(robot, dir)
        if grid[np] == "#":
            continue
        if grid[np] not in "[]":
            robot = np
            continue

        # np is a box
        moves = moves_for(np, dir)
        if not moves:
            continue

        robot = np
        moved_boxes = {}
        for p in moves:
            moved_boxes[addp(p, dir)] = grid[p]
            grid[p] = "."
        for p, c in moved_boxes.items():
            grid[p] = c

    # grid.display()
    return sum(x + y * 100 for x, y in grid.findall("["))


if __name__ == "__main__":
    main(
        part1,
        part2,
        # isolate=1,
    )
