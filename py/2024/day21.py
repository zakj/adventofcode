from functools import cache
from itertools import pairwise

from aoc import main
from aoc.coords import Grid, Point, neighbors, subp
from aoc.graph_dyn import DiGraph, all_shortest_paths

NUMERIC = Grid("""
789
456
123
 0A
""")

DIRECTIONAL = Grid("""
 ^A
<v>
""")


class Keypad(DiGraph):
    cur: Point

    def __init__(self, grid: Grid):
        self.grid = grid
        self.cur = grid.find("A")

    def __getitem__(self, p: Point) -> set[Point]:
        return {n for n in neighbors(p) if self.grid.get(n, " ") != " "}


dir_to_key = {
    (0, -1): "^",
    (1, 0): ">",
    (0, 1): "v",
    (-1, 0): "<",
}


def path_to_key(path: list[Point]) -> str:
    keys = []
    for a, b in pairwise(path):
        keys.append(dir_to_key[subp(b, a)])
    return "".join(keys) + "A"


@cache
def rr(nbots: int, keys: str, is_first=False) -> int:
    bot = Keypad(NUMERIC if is_first else DIRECTIONAL)
    total = 0
    for c in keys:
        end = bot.grid.find(c)
        paths = [path_to_key(p) for p in all_shortest_paths(bot, bot.cur, end)]
        if nbots == 0:
            total += len(paths[0])
        else:
            total += min(rr(nbots - 1, nkeys) for nkeys in paths)
        bot.cur = end
    return total


def keypad_complexity(s: str, bot_count: int) -> int:
    codes = s.splitlines()
    return sum(int(code[:-1]) * rr(bot_count, code, True) for code in codes)


if __name__ == "__main__":
    main(
        lambda s: keypad_complexity(s, 2),
        lambda s: keypad_complexity(s, 25),
    )
