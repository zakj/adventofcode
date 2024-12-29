from aoc import main
from aoc.coords import Point3
from aoc.parse import all_numbers, line_parser


@line_parser
def parse(line: str):
    return Point3(all_numbers(line))


def neighbors(p: Point3) -> set[Point3]:
    x, y, z = p
    return {
        (x + 1, y, z),
        (x - 1, y, z),
        (x, y + 1, z),
        (x, y - 1, z),
        (x, y, z + 1),
        (x, y, z - 1),
    }


def surface_area(s: str) -> int:
    cubes = set(parse(s))
    return len([1 for c in cubes for n in neighbors(c) if n not in cubes])


def exterior_surface_area(s: str) -> int:
    cubes = set(parse(s))
    vmin = min([v for c in cubes for v in c]) - 1
    vmax = max([v for c in cubes for v in c]) + 1
    stack: list[Point3] = [(vmin, vmin, vmin)]
    empty: set[Point3] = set()
    while stack:
        cur = stack.pop()
        for n in neighbors(cur) - cubes - empty:
            if all(vmin <= v <= vmax for v in n):
                stack.append(n)
        empty.add(cur)
    return len([1 for c in cubes for n in neighbors(c) if n in empty])


if __name__ == "__main__":
    main(surface_area, exterior_surface_area)
