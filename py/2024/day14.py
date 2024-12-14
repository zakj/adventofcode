from aoc import main, status
from coords import Point, Vector, addp, subp
from parse import all_numbers, line_parser


@line_parser
def parse(line: str) -> tuple[Point, Vector]:
    px, py, vx, vy = all_numbers(line)
    return (px, py), (vx, vy)
    pass


def part1(s: str, width=101, height=103) -> int:
    robots = parse(s)
    for _ in range(100):
        for i, (p, d) in enumerate(robots):
            p = addp(p, d)
            robots[i] = (p[0] % width, p[1] % height), d

    nw = 0
    ne = 0
    se = 0
    sw = 0
    for (x, y), _ in robots:
        if x < width // 2 and y < height // 2:
            nw += 1
        elif x > width // 2 and y < height // 2:
            ne += 1
        elif x > width // 2 and y > height // 2:
            se += 1
        elif x < width // 2 and y > height // 2:
            sw += 1

    return nw * ne * se * sw


def print_tree(ps: set[Point], width: int, height: int):
    for y in range(height):
        row = []
        for x in range(width):
            row.append("@" if (x, y) in ps else ".")
        print("".join(row))


def part2(s: str, width=101, height=103) -> int:
    robots = parse(s)
    for _ in range(10000):
        status(str(_))
        for i, (p, d) in enumerate(robots):
            p = addp(p, d)
            robots[i] = (p[0] % width, p[1] % height), d

        symm = True
        midx = width // 2
        midy = height // 2
        locs = {p for p, _ in robots}
        if len(locs) != len(robots):
            continue

        print(_)
        print_tree(locs, width, height)
        print()

        # for x, y in locs:
        #     if x < midx:
        #         delta = midx - x
        #         if addp((midx, y), (delta, 0)) not in locs:
        #             symm = False
        #             break
        #     elif x > midx:
        #         delta = x - midx
        #         if subp((midx, y), (delta, 0)) not in locs:
        #             symm = False
        #             break
        # if symm:
        #     print_tree(locs, width, height)

    # nw = 0
    #     ne = 0
    #     se = 0
    #     sw = 0
    #     symm = True
    #     for (x, y), _ in robots:
    #         if x < width // 2 and y < height // 2:
    #             nw += 1
    #         elif x > width // 2 and y < height // 2:
    #             ne += 1
    #         elif x > width // 2 and y > height // 2:
    #             se += 1
    #         elif x < width // 2 and y > height // 2:
    #             sw += 1

    #     if nw == ne and sw == se and nw > sw:
    #         locs = {p for p, _ in robots}
    #         print_tree(locs, width, height)
    #         print()
    #         print()

    # #     locs = {p for p, _ in robots}
    #     top = min(y for x, y in locs)
    #     if (
    #         len([1 for x, y in locs if y == top]) == 1
    #         and len([1 for x, y in locs if y == top + 1]) == 3
    #         and len([1 for x, y in locs if y == top + 2]) == 5
    #     ):
    #         # if len([1 for y in range(height) if (width // 2, y) in locs]) > 5:
    #         print_tree(locs, width, height)
    # return 0
    return 0


if __name__ == "__main__":
    main(
        part1,
        part2,
    )
