from functools import cache
from itertools import pairwise

from aoc import main
from coords import Grid, Point, neighbors, subp
from graph_dyn import DiGraph, all_shortest_paths

# TODO with no progress/status, running duration is in the wrong column

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
def rr(nbots: int, keys: str) -> int:
    bot = Keypad(DIRECTIONAL)
    total = 0
    for c in keys:
        end = bot.grid.find(c)
        paths = [path_to_key(p) for p in all_shortest_paths(bot, bot.cur, end)]
        if nbots == 1:
            total += len(paths[0])
        else:
            total += min(rr(nbots - 1, nkeys) for nkeys in paths)
        bot.cur = end
    return total


def keypad_complexity(s: str, bot_count: int) -> int:
    num_bot = Keypad(NUMERIC)

    total = 0
    codes = s.splitlines()
    for code in codes:
        numeric = int(code[:-1])
        best = 0
        for c in code:
            end = num_bot.grid.find(c)
            options = [
                path_to_key(p) for p in all_shortest_paths(num_bot, num_bot.cur, end)
            ]
            num_bot.cur = end
            best += min([rr(bot_count, option) for option in options])
        total += numeric * best
    return total


if __name__ == "__main__":
    main(
        lambda s: keypad_complexity(s, 2),
        lambda s: keypad_complexity(s, 25),
    )
