from aoc import main
from coords import Dir8, Grid, Point, Vector, addp


class StringGrid(Grid[str]):
    def substr(self, start: Point, dir: Vector, length: int) -> str:
        rv = []
        cur = start
        while len(rv) < length:
            rv.append(self.get(cur, ""))
            cur = addp(cur, dir)
        return "".join(rv)


def count_xmas(s: str) -> int:
    grid = StringGrid(s)
    count = 0
    for p in grid.findall("X"):
        count += len([1 for dir in Dir8 if grid.substr(p, dir, 4) == "XMAS"])
    return count


def count_cross_mas(s: str) -> int:
    grid = StringGrid(s)
    goals = ["MAS", "SAM"]
    count = 0
    for x, y in grid.findall("A"):
        if (
            grid.substr((x - 1, y - 1), Dir8.SE, 3) in goals
            and grid.substr((x - 1, y + 1), Dir8.NE, 3) in goals
        ):
            count += 1
    return count


if __name__ == "__main__":
    main(count_xmas, count_cross_mas)
