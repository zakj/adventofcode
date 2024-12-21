from functools import cache
from itertools import pairwise
from math import inf

from aoc import main
from coords import Point, neighbors, subp
from graph_dyn import DiGraph, all_shortest_paths

# TODO with no progress/status, running duration is in the wrong column


class Keypad(DiGraph):
    start: Point
    cur: Point
    keys: dict[str, Point]

    def __init__(self):
        self.cur = self.start
        self.grid = {v: k for k, v in self.keys.items()}

    def __getitem__(self, p: Point) -> set[Point]:
        return {n for n in neighbors(p) if n in self.grid}


class NumericKeypad(Keypad):
    start = (2, 3)

    keys = {
        "7": (0, 0),
        "8": (1, 0),
        "9": (2, 0),
        "4": (0, 1),
        "5": (1, 1),
        "6": (2, 1),
        "1": (0, 2),
        "2": (1, 2),
        "3": (2, 2),
        "0": (1, 3),
        "A": (2, 3),
    }


class DirectionalKeypad(Keypad):
    start = (2, 0)

    keys = {
        "^": (1, 0),
        "A": (2, 0),
        "<": (0, 1),
        "v": (1, 1),
        ">": (2, 1),
    }


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
    bot = DirectionalKeypad()
    total = 0
    for c in keys:
        paths = [path_to_key(p) for p in all_shortest_paths(bot, bot.cur, bot.keys[c])]
        if nbots == 1:
            total += len(paths[0])
        else:
            total += min(rr(nbots - 1, nkeys) for nkeys in paths)
        bot.cur = bot.keys[c]
    return total


def keypad_complexity(s: str, bot_count: int) -> int:
    num_bot = NumericKeypad()

    total = 0
    codes = s.splitlines()
    for code in codes:
        numeric = int(code[:-1])
        best = 0
        for c in code:
            options = [
                path_to_key(p)
                for p in all_shortest_paths(num_bot, num_bot.cur, num_bot.keys[c])
            ]
            num_bot.cur = num_bot.keys[c]
            best += min([rr(bot_count, option) for option in options])
        total += numeric * best
    return total


if __name__ == "__main__":
    main(
        lambda s: keypad_complexity(s, 2),
        lambda s: keypad_complexity(s, 25),
    )
